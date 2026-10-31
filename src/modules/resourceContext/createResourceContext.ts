import { err, ok } from "neverthrow";

import { appErr } from "../../utils/deps/neverthrow/errorFactory.js";
import type { ConfigResourceFile } from "../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceReference } from "../../validation/resourceReference/config/schemas/configResourceReference.js";
import type { WorkspaceContext } from "../../validation/workspaceContext/schemas/workspaceContext.js";
import { resolveWorkspaceResourceReference } from "../workspaceContext/resolveWorkspaceResourcePath.js";
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
    loadWorkflow(workflow: ConfigResourceReference) {
      const workspaceContext = state.getState().workspaceContext;
      const absolutePathResult = resolveWorkspaceResourceReference(
        workspaceContext,
        workflow.filePath.path,
      );
      if (!absolutePathResult.isOk()) {
        return absolutePathResult;
      }
      const workflowFileKey = state
        .getState()
        .referenceMapping.configReferences.workflows.get(absolutePathResult.value);
      if (workflowFileKey === undefined) {
        return appErr("module_resourceContext_loadWorkflow_workflowNotFound", {
          workflow: absolutePathResult.value,
        });
      }
      return state.getState().resources.configResources.workflows.get(workflowFileKey)?.resource;
    },
    loadTemplateByWorkflow(workflow: ConfigResourceReference) {
      const workspaceContext = state.getState().workspaceContext;
      const absolutePathResult = resolveWorkspaceResourceReference(
        workspaceContext,
        workflow.filePath.path,
      );
      if (!absolutePathResult.isOk()) {
        return absolutePathResult;
      }
      const workflowFileKey = state
        .getState()
        .referenceMapping.configReferences.workflows.get(absolutePathResult.value);
      if (workflowFileKey === undefined) {
        return appErr("module_resourceContext_loadTemplate_workflowNotFound", {
          workflow: absolutePathResult.value,
        });
      }
      // Lookup template reference in workflow state
      const workflowResource = state
        .getState()
        .resources.configResources.workflows.get(workflowFileKey);
      if (workflowResource === undefined) {
        return appErr("module_resourceContext_loadTemplate_stateContainsInvalidWorkflow", {
          workflow: absolutePathResult.value,
        });
      }
      const templateFileReference = workflowResource.resource.getWorkflowData().templateFile;
      const templateFileAbsolutePathResult = resolveWorkspaceResourceReference(
        workspaceContext,
        templateFileReference.filePath.path,
      );
      if (templateFileAbsolutePathResult.isErr()) {
        return templateFileAbsolutePathResult;
      }
      const templateFileKey = state
        .getState()
        .referenceMapping.templateReferences.templates.get(templateFileAbsolutePathResult.value);
      if (templateFileKey === undefined) {
        return appErr("module_resourceContext_loadTemplate_templateNotFound", {
          template: templateFileAbsolutePathResult.value,
        });
      }
      return state.getState().resources.templateResources.templates.get(templateFileKey);
    },
  };
}
