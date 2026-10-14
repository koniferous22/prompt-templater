import { ok } from "neverthrow";
import { match } from "ts-pattern";

import type { ConfigResourceFile } from "../../validation/codecs/configResource/resourceAbsolutePathToResourceFile.js";
import type { TemplateResourceFile } from "../../validation/codecs/templateResource/resourceAbsolutePathToResourceFile.js";
import type { File } from "../../validation/schemas/fs/file.js";
import type { WorkspaceContext } from "../../validation/schemas/workspaceContext.js";
import { configResourceFromResourceFile } from "../resources/config/resourceFromResourceFile.js";
import type { ConfigResourceType } from "../resources/config/resourceTypes.js";
import { templateResourceFileFromInput } from "../resources/template/resourceFileFromInput.js";

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
        templates: new Map<File, { templateResourceFile: any; template: any }>(),
      },
    },
    workspaceContext,
  };
  return state;
};

export type TemplateContextState = ReturnType<typeof initState>;
export type TemplateContextAddResourceOperation =
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
      type: "listResource";
      // TYPE TBD
      file: any;
    };
export type TemplateContextMutationFnResult = {
  state: TemplateContextState;
  enqueuedOperations: TemplateContextAddResourceOperation[];
};

export const loadResource = async (
  state: TemplateContextState,
  operation: TemplateContextAddResourceOperation,
) => {
  return match(operation)
    .with({ type: "configResource" }, async (value) => {
      if (state.resources.configResources.workflows.has(value.file.file)) {
        // return noop if file already processed
        return ok({
          state,
          enqueuedOperations: [],
        } satisfies TemplateContextMutationFnResult);
      }
      // 1 - Load file
      const loadingResult = await configResourceFromResourceFile("workflow", value.file);
      if (!loadingResult.isOk()) {
        return loadingResult;
      }
      // 2 - Process references
      const templateFileReferenceResult = await templateResourceFileFromInput(
        loadingResult.value.templateFile,
        state.workspaceContext,
      );
      if (!templateFileReferenceResult.isOk()) {
        return templateFileReferenceResult;
      }
      // 3 - update state
      state.resources.configResources.workflows.set(value.file.file, {
        configResourceFile: value.file,
        contents: loadingResult.value,
      });
      return ok({
        state,
        enqueuedOperations: [
          {
            type: "templateResource",
            file: templateFileReferenceResult.value,
          },
        ],
      } satisfies TemplateContextMutationFnResult);
    })
    .with({ type: "templateResource" }, async (value) => {
      // WIP - Noop
      return ok({
        state,
        enqueuedOperations: [],
      } satisfies TemplateContextMutationFnResult);
    })
    .with({ type: "listResource" }, async (value) => {
      // WIP - Noop
      return ok({
        state,
        enqueuedOperations: [],
      } satisfies TemplateContextMutationFnResult);
    })
    .exhaustive();
};

const addResource = async (
  initState: TemplateContextState,
  operation: TemplateContextAddResourceOperation,
) => {
  const queue: TemplateContextAddResourceOperation[] = [operation];
  let currentOperation: TemplateContextAddResourceOperation | null = queue.shift() ?? null;
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

export const initializeTemplateContext = (workspaceContext: WorkspaceContext) => {
  let state = initState(workspaceContext);
  return {
    getState() {
      return state;
    },
    async addResource(operation: TemplateContextAddResourceOperation) {
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
