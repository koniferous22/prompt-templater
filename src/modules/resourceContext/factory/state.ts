import { err, Ok, ok } from "neverthrow";
import { match } from "ts-pattern";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { isNonEmptyArray } from "../../../utils/array/isNonEmptyArray.js";
import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import { errorFromErrorList } from "../../../utils/deps/neverthrow/errorList.js";
import type { AppError } from "../../../utils/deps/neverthrow/types.js";
import type { File } from "../../../validation/fs/schemas/file.js";
import {
  AbsolutePathSchema,
  type AbsolutePath,
} from "../../../validation/path/customTypes/index.js";
import { type ConfigResourceFile } from "../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import { type TemplateResourceFile } from "../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import { type TermResourceFile } from "../../../validation/resourceFile/term/codecs/resourceAbsolutePathToResourceFile.js";
import type { TermValueType } from "../../../validation/resources/term/term/factories/termByTermType.js";
import type { WorkspaceContext } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import type {
  ConfigResourceType,
  ConfigResourceTypes,
} from "../../resources/config/factories/resourceFactories.js";
import { configResourceFromResourceFile } from "../../resources/config/resourceFromResourceFile.js";
import { templateResourceFromResourceFile } from "../../resources/template/resourceFromResourceFile.js";
import { templateResourceFileFromReference } from "../../resources/template/utils/resourceFileFromReference.js";
import type { TermResourceTypes } from "../../resources/terms/factories/resourceFactories.js";
import { termResourceFromResourceFile } from "../../resources/terms/resourceFromResourceFile.js";
import { termResourceFileFromReference } from "../../resources/terms/utils/resourceFileFromReference.js";

const initState = (workspaceContext: WorkspaceContext) => {
  const state = {
    resources: {
      configResources: {
        workflows: new Map<
          File,
          { configResourceFile: ConfigResourceFile; resource: ConfigResourceTypes["workflow"] }
        >(),
        workflowPresets: new Map<
          File,
          { configResourceFile: ConfigResourceFile; resource: null }
        >(),
      },
      termResources: {
        terms: new Map<
          File,
          { termResourceFile: TermResourceFile; resource: TermResourceTypes["term"] }
        >(),
      },
      templateResources: {
        templates: new Map<
          File,
          {
            templateResourceFile: TemplateResourceFile;
            template: (resourceContext: Record<string, any>) => string;
          }
        >(),
      },
    },
    referenceMapping: {
      configReferences: {
        workflows: new Map<AbsolutePath, File>(),
        workflowPresets: new Map<AbsolutePath, File>(),
      },
      termReferences: {
        terms: new Map<AbsolutePath, File>(),
      },
      templateReferences: {
        templates: new Map<AbsolutePath, File>(),
      },
    },
    workspaceContext,
  };
  return state;
};

export type ResourceContextState = ReturnType<typeof initState>;
export type ResourceContextAddResourceOperation =
  | {
      type: "configResource";
      configResourceType: ConfigResourceType;
      file: ConfigResourceFile;
    }
  | {
      type: "templateResource";
      file: TemplateResourceFile;
    }
  | {
      type: "termResource";
      file: TermResourceFile;
      valueType: TermValueType;
    };
export type ResourceContextMutationFnResult = {
  state: ResourceContextState;
  enqueuedOperations: ResourceContextAddResourceOperation[];
};

export const loadResource = async (
  state: ResourceContextState,
  operation: ResourceContextAddResourceOperation,
) => {
  return match(operation)
    .with({ type: "configResource" }, async (value) => {
      if (state.resources.configResources.workflows.has(value.file.file)) {
        // return noop if file already processed
        return ok({
          state,
          enqueuedOperations: [],
        } satisfies ResourceContextMutationFnResult);
      }
      // 1 - Load file
      const loadResourceResult = await configResourceFromResourceFile("workflow", value.file);
      if (!loadResourceResult.isOk()) {
        return loadResourceResult;
      }
      const resource = loadResourceResult.value;
      const resourceReferences = resource.getReferences();
      // 2 - Process references
      const [templateFileReferenceResult, { termResourceFiles, errors: termResourceErrors }] =
        await Promise.all([
          templateResourceFileFromReference(
            resourceReferences.template.reference,
            state.workspaceContext,
          ),
          (async () => {
            const termResults = await Promise.all(
              resourceReferences.terms.map(async ({ reference, termType }) => {
                const resourceFileResult = await termResourceFileFromReference(
                  reference,
                  state.workspaceContext,
                );
                return resourceFileResult.isOk()
                  ? {
                      type: "termResourceFile" as const,
                      file: resourceFileResult.value,
                      termType,
                    }
                  : {
                      type: "error" as const,
                      error: resourceFileResult.error,
                    };
              }),
            );
            return {
              errors: termResults
                .filter((termResult) => termResult.type === "error")
                .map(({ error }) => error),
              termResourceFiles: termResults.filter(
                (termResult) => termResult.type === "termResourceFile",
              ),
            };
          })(),
        ]);
      const errors: AppError<AppErrorCode>[] = [];
      if (!templateFileReferenceResult.isOk()) {
        errors.push(templateFileReferenceResult.error);
      }
      if (isNonEmptyArray(termResourceErrors)) {
        errors.push(...termResourceErrors);
      }
      if (isNonEmptyArray(errors)) {
        return err(errorFromErrorList(...errors));
      }
      // 3 - update state - mark workflow as loaded
      state.resources.configResources.workflows.set(value.file.file, {
        configResourceFile: value.file,
        resource: loadResourceResult.value,
      });
      // 4 - update state - update reference mapping
      const absolutePathResult = AbsolutePathSchema.safeParse(value.file.file);
      if (!absolutePathResult.success) {
        return appErr("module_resourceContext_state_invalidResourceFilePath", {
          value: value.file.file,
        });
      }
      state.referenceMapping.configReferences.workflows.set(
        absolutePathResult.data,
        value.file.file,
      );
      return ok({
        state,
        enqueuedOperations: [
          {
            type: "templateResource",
            file: (
              templateFileReferenceResult as Extract<
                typeof templateFileReferenceResult,
                Ok<any, any>
              >
            ).value,
          },
          ...termResourceFiles.map(({ file, termType }) => ({
            type: "termResource" as const,
            file,
            valueType: termType,
          })),
        ],
      } satisfies ResourceContextMutationFnResult);
    })
    .with({ type: "templateResource" }, async (value) => {
      if (state.resources.templateResources.templates.has(value.file.file)) {
        // return noop if file already processed
        return ok({
          state,
          enqueuedOperations: [],
        } satisfies ResourceContextMutationFnResult);
      }
      // 1 - Load file
      const loadingResult = await templateResourceFromResourceFile(value.file);
      if (!loadingResult.isOk()) {
        return loadingResult;
      }
      // 2 - update state - mark template as loaded
      state.resources.templateResources.templates.set(value.file.file, {
        templateResourceFile: value.file,
        template: loadingResult.value,
      });
      // 3 - update state - update reference mapping
      const absolutePathResult = AbsolutePathSchema.safeParse(value.file.file);
      if (!absolutePathResult.success) {
        return appErr("module_resourceContext_state_invalidResourceFilePath", {
          value: value.file.file,
        });
      }
      state.referenceMapping.templateReferences.templates.set(
        absolutePathResult.data,
        value.file.file,
      );
      return ok({
        state,
        enqueuedOperations: [],
      } satisfies ResourceContextMutationFnResult);
    })
    .with({ type: "termResource" }, async (value) => {
      if (state.resources.termResources.terms.has(value.file.file)) {
        // return noop if file already processed
        return ok({
          state,
          enqueuedOperations: [],
        } satisfies ResourceContextMutationFnResult);
      }
      const loadingResult = await termResourceFromResourceFile(value.file, value.valueType);
      if (!loadingResult.isOk()) {
        return loadingResult;
      }
      // 2 - update state
      state.resources.termResources.terms.set(value.file.file, {
        termResourceFile: value.file,
        resource: loadingResult.value,
      });
      // 3 - update state - update reference mapping
      const absolutePathResult = AbsolutePathSchema.safeParse(value.file.file);
      if (!absolutePathResult.success) {
        return appErr("module_resourceContext_state_invalidResourceFilePath", {
          value: value.file.file,
        });
      }
      state.referenceMapping.termReferences.terms.set(absolutePathResult.data, value.file.file);
      return ok({
        state,
        enqueuedOperations: [],
      } satisfies ResourceContextMutationFnResult);
    })
    .exhaustive();
};

const addResource = async (
  initState: ResourceContextState,
  operation: ResourceContextAddResourceOperation,
) => {
  const queue: ResourceContextAddResourceOperation[] = [operation];
  let currentOperation: ResourceContextAddResourceOperation | null = queue.shift() ?? null;
  let state = initState;
  while (currentOperation !== null) {
    const result = await loadResource(initState, currentOperation);
    if (!result.isOk()) {
      return result;
    }
    state = result.value.state;
    queue.push(...result.value.enqueuedOperations);
    currentOperation = queue.shift() ?? null;
  }
  return ok(state);
};

export const initializeResourceContext = (workspaceContext: WorkspaceContext) => {
  let state = initState(workspaceContext);
  return {
    getState() {
      return state;
    },
    async addResource(operation: ResourceContextAddResourceOperation) {
      const addResourceResult = await addResource(state, operation);
      if (!addResourceResult.isOk()) {
        return addResourceResult;
      }
      // Note - shold preserve `state` reference
      state = addResourceResult.value;
      return ok(this);
    },
  };
};
