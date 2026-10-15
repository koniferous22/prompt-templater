import { ok } from "neverthrow";

import { appErrAsync } from "../../utils/deps/neverthrow/errorFactory.js";
import type { ConfigResourceFile } from "../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceAbsolutePath } from "../../validation/resourceReference/config/schemas/configResourceAbsolutePath.js";
import {
  createDeferredContext,
  type DeferredContextOpts,
} from "../deferredInputContext/deferredInputContext.js";
import { configResourceFileFromAbsolutePath } from "../resources/config/resourceFileFromAbsolutePath.js";
import { detectWorkspaceContextFromCliInput } from "../workspaceContext/detectWorkspaceContext.js";
import { createTemplateContext } from "./createTemplateContext.js";

export async function createTemplateContextFromDeferredWorkspaceContext(
  workflowResourcePath: ConfigResourceAbsolutePath,
  deferredContextOpts: DeferredContextOpts,
) {
  // Workflow absolute path is taken as SSOT in case no context has been found
  const workflowAbsolutePath = workflowResourcePath;
  const workflowResult = await configResourceFileFromAbsolutePath(workflowAbsolutePath);
  if (!workflowResult.isOk()) {
    return appErrAsync(
      "module_templateContext_createTemplateContextFromDeferredWorkspaceContext_invalidWorkflowPath",
      {
        workflowFileInput: workflowAbsolutePath.path,
      },
    );
  }
  // Defer resource resolution until "workspace context is detected"
  const deferredContextResult = await createDeferredContext(deferredContextOpts);
  if (!deferredContextResult.isOk()) {
    return deferredContextResult;
  }
  const deferreContextState = deferredContextResult.value.getState();
  // Invoke dynamic context detection
  const detectContextResult = await detectWorkspaceContextFromCliInput({
    workflow: workflowResult.value,
    workflowPreset:
      deferreContextState.workflowPreset !== undefined &&
      deferreContextState.workflowPreset.type === "resolved"
        ? deferreContextState.workflowPreset.value
        : undefined,
  });
  if (!detectContextResult.isOk()) {
    return detectContextResult;
  }
  const resolvedDeferredContext = await deferredContextResult.value.resolve(
    detectContextResult.value,
  );
  if (!resolvedDeferredContext.isOk()) {
    return resolvedDeferredContext;
  }
  // Build template context and include all items
  const templateContext = createTemplateContext(detectContextResult.value);
  const addWorkflowResult = await templateContext.addWorkflow(workflowResult.value);
  if (!addWorkflowResult.isOk()) {
    return addWorkflowResult;
  }
  if (resolvedDeferredContext.value.workflowPreset !== undefined) {
    const addWorkflowPresetResult = await templateContext.addWorkflowPreset(
      resolvedDeferredContext.value.workflowPreset,
    );
    if (!addWorkflowPresetResult.isOk()) {
      return addWorkflowPresetResult;
    }
  }
  return ok(templateContext);
}
