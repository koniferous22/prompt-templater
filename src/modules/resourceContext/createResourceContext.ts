import { ok } from "neverthrow";

import type { ConfigResourceFile } from "../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import type { WorkspaceContext } from "../../validation/workspaceContext/schemas/workspaceContext.js";
import { initializeResourceContext } from "./state.js";

export function createResourceContext(workspaceContext: WorkspaceContext) {
  const state = initializeResourceContext(workspaceContext);
  return {
    getState() {
      return state.getState();
    },
    async addWorkflow(file: ConfigResourceFile) {
      const result = await state.addResource({
        type: "configResource",
        configResourceType: "workflow",
        file,
      });
      return result.isOk() ? ok(this) : result;
    },
    async addWorkflowPreset(file: ConfigResourceFile) {
      // TBD - noop for now
      return ok(this);
    },
    loadTemplate() {
      // TBD
      return undefined;
    },
    loadWorkflow() {
      // TBD
      return undefined;
    },
  };
}
