import type { ConfigResourceFile } from "../../validation/codecs/configResource/resourceAbsolutePathToResourceFile.js";
import type { WorkspaceContext } from "../../validation/schemas/workspaceContext.js";
import { initializeTemplateContext } from "./state.js";

export function createTemplateContext(workspaceContext: WorkspaceContext) {
  const state = initializeTemplateContext(workspaceContext);
  return {
    getState() {
      return state.getState();
    },
    async addWorkflow(file: ConfigResourceFile) {
      await state.addResource({
        type: "configResource",
        configResourceType: "workflow",
        file,
      });
      return this;
    },
    async addWorkflowPreset(file: ConfigResourceFile) {
      // TBD - noop for now
      return this;
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
