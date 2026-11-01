import { ok, type Ok } from "neverthrow";

import { resultFromOptionalErrorList } from "../../utils/deps/neverthrow/optionalErrorList.js";
import type { ConfigResourceReference } from "../../validation/resourceReference/config/schemas/configResourceReference.js";
import type { WorkspaceContext } from "../../validation/workspaceContext/schemas/workspaceContext.js";
import { configResourceFileFromReference } from "../resources/config/utils/resourceFileFromReference.js";
import { createResourceContext } from "./factory/resourceContext.js";

export const createResourceContextFromExplicitWorkspace = async (
  workspaceContext: WorkspaceContext,
  {
    workflow,
    workflowPreset,
  }: {
    workflow: ConfigResourceReference;
    workflowPreset?: ConfigResourceReference;
  },
) => {
  const workflowResult = await configResourceFileFromReference(workflow, workspaceContext);
  const workflowPresetResult =
    workflowPreset && (await configResourceFileFromReference(workflowPreset, workspaceContext));

  if (
    !workflowResult.isOk() ||
    (workflowPresetResult !== undefined && !workflowPresetResult.isOk())
  ) {
    const error = resultFromOptionalErrorList(
      workflowResult.isErr() ? workflowResult : undefined,
      workflowPresetResult !== undefined && workflowPresetResult.isErr()
        ? workflowPresetResult
        : undefined,
    );
    // Note - incomplete type narrowing - Should be error
    return error as Exclude<typeof error, Ok<null, never>>;
  }
  // Build template context and include all items
  const resourceContext = createResourceContext(workspaceContext);
  const addWorkflowResult = await resourceContext.addWorkflow(workflowResult.value);
  if (!addWorkflowResult.isOk()) {
    return addWorkflowResult;
  }
  if (workflowPresetResult !== undefined) {
    await resourceContext.addWorkflowPreset(workflowPresetResult.value);
  }
  return ok(resourceContext);
};
