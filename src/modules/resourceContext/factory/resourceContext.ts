import { ok } from "neverthrow";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import type { ConfigResourceFile } from "../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceReference } from "../../../validation/resourceReference/config/schemas/configResourceReference.js";
import type { TemplateResourceReference } from "../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import type { TermResourceReference } from "../../../validation/resourceReference/term/schemas/termResourceReference.js";
import type { WorkspaceContext } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { resolveWorkspaceResourceReference } from "../../workspaceContext/resolveWorkspaceResourcePath.js";
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
    async addWorkflowPreset(_file: ConfigResourceFile) {
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
      const workflowResource = state
        .getState()
        .resources.configResources.workflows.get(workflowFileKey);
      if (workflowResource === undefined) {
        return appErr("module_resourceContext_loadWorkflow_workflowNotFound", {
          workflow: absolutePathResult.value,
        });
      }
      return ok(workflowResource);
    },
    loadTemplate(template: TemplateResourceReference) {
      const workspaceContext = state.getState().workspaceContext;
      const absolutePathResult = resolveWorkspaceResourceReference(
        workspaceContext,
        template.filePath.path,
      );
      if (!absolutePathResult.isOk()) {
        return absolutePathResult;
      }
      const templateFileKey = state
        .getState()
        .referenceMapping.templateReferences.templates.get(absolutePathResult.value);
      if (templateFileKey === undefined) {
        return appErr("module_resourceContext_loadTemplate_templateNotFound", {
          template: absolutePathResult.value,
        });
      }
      const templateResult = state
        .getState()
        .resources.templateResources.templates.get(templateFileKey);
      if (templateResult === undefined) {
        return appErr("module_resourceContext_loadTemplate_templateNotFound", {
          template: absolutePathResult.value,
        });
      }
      return ok(templateResult);
    },
    loadTerm(term: TermResourceReference) {
      const workspaceContext = state.getState().workspaceContext;
      const absolutePathResult = resolveWorkspaceResourceReference(
        workspaceContext,
        term.filePath.path,
      );
      if (!absolutePathResult.isOk()) {
        return absolutePathResult;
      }
      const termFileKey = state
        .getState()
        .referenceMapping.termReferences.terms.get(absolutePathResult.value);
      if (termFileKey === undefined) {
        return appErr("module_resourceContext_loadTerm_termNotFound", {
          term: absolutePathResult.value,
        });
      }
      const termResult = state.getState().resources.termResources.terms.get(termFileKey);
      if (termResult === undefined) {
        return appErr("module_resourceContext_loadTerm_termNotFound", {
          term: absolutePathResult.value,
        });
      }
      return ok(termResult);
    },
  };
}

export type ResourceContext = ReturnType<typeof createResourceContext>;
