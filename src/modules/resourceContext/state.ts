import { ok } from "neverthrow";
import { match } from "ts-pattern";

import type { File } from "../../validation/fs/schemas/file.js";
import type { ConfigResourceFile } from "../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import type { TemplateResourceFile } from "../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import type { WorkspaceContext } from "../../validation/workspaceContext/schemas/workspaceContext.js";
import type { ConfigResourceType } from "../resources/config/factories/resourceFactories.js";
import { configResourceFromResourceFile } from "../resources/config/resourceFromResourceFile.js";
import { templateResourceFromResourceFile } from "../resources/template/resourceFromResourceFile.js";
import { templateResourceFileFromReference } from "../resources/template/utils/resourceFileFromReference.js";

const initState = (workspaceContext: WorkspaceContext) => {
  const state = {
    resources: {
      configResources: {
        // Type TBD
        workflows: new Map<File, { configResourceFile: ConfigResourceFile; contents: any }>(),
        workflowPresets: new Map<File, { configResourceFile: ConfigResourceFile; contents: any }>(),
      },
      listResources: {
        terms: new Map<File, { listResourceFile: any; data: any }>(),
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
      file: any;
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
      const templateFileReferenceResult = await templateResourceFileFromReference(
        resourceReferences.template.reference,
        state.workspaceContext,
      );
      if (!templateFileReferenceResult.isOk()) {
        return templateFileReferenceResult;
      }

      // 3 - update state
      state.resources.configResources.workflows.set(value.file.file, {
        configResourceFile: value.file,
        contents: loadResourceResult.value,
      });
      return ok({
        state,
        enqueuedOperations: [
          {
            type: "templateResource",
            file: templateFileReferenceResult.value,
          },
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
      // 2 - update state
      state.resources.templateResources.templates.set(value.file.file, {
        templateResourceFile: value.file,
        template: loadingResult.value,
      });
      return ok({
        state,
        enqueuedOperations: [],
      } satisfies ResourceContextMutationFnResult);
    })
    .with({ type: "termResource" }, async (value) => {
      // WIP - Noop
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
