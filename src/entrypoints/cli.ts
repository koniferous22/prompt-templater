import { message } from "@optique/core/message";
import { run } from "@optique/run";
import { Ok, ok } from "neverthrow";

import { cliArgsParser, type CliArgs } from "../modules/optique/cliArgs.js";
import { envContext } from "../modules/optique/context/env.js";
import { createResourceContext } from "../modules/resourceContext/createResourceContext.js";
import { createResourceContextFromDeferredWorkspaceContext } from "../modules/resourceContext/createResourceContextFromDeferredWorkspaceContext.js";
import { configResourceFileFromReference } from "../modules/resources/config/resourceFileFromReference.js";
import { appErrAsync } from "../utils/deps/neverthrow/errorFactory.js";
import { resultFromOptionalErrorList } from "../utils/deps/neverthrow/optionalErrorList.js";
import type { WorkspaceContext } from "../validation/workspaceContext/schemas/workspaceContext.js";

type ResolveContextArgs = {
  positionalArgs: Pick<CliArgs["positionalArgs"], "workflow" | "workflowPreset">;
  globalOptions: Pick<CliArgs["globalOptions"], "context">;
};

const resolveResourceContextFromExplicitWorkspace = async (
  workspaceContext: WorkspaceContext,
  {
    workflow,
    workflowPreset,
  }: Pick<ResolveContextArgs["positionalArgs"], "workflow" | "workflowPreset">,
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
    const addWorkflowPresetResult = await resourceContext.addWorkflowPreset(
      workflowPresetResult.value,
    );
    if (!addWorkflowPresetResult.isOk()) {
      return addWorkflowPresetResult;
    }
  }
  return ok(resourceContext);
};

const resolveResourceContext = async ({ positionalArgs, globalOptions }: ResolveContextArgs) => {
  if (globalOptions.context !== undefined) {
    return resolveResourceContextFromExplicitWorkspace(globalOptions.context, positionalArgs);
  }
  if (positionalArgs.workflow.type === "relative") {
    return appErrAsync("entrypoint_cli_unableToDetectContext", {
      workflowFileInput: positionalArgs.workflow.filePath.path,
    });
  }
  return createResourceContextFromDeferredWorkspaceContext(positionalArgs.workflow.filePath, {
    workflowPreset: positionalArgs.workflowPreset,
  });
};

export const main = async () => {
  const cliInput = await run(cliArgsParser, {
    programName: "prompt-templater-v1",
    contexts: [envContext],
    help: "option",
    brief: message`"prompt-templater" ~ interactive templating util for quick text composition`,
  });
  const resourceContextResult = await resolveResourceContext(cliInput);
  if (!resourceContextResult.isOk()) {
    return resourceContextResult;
  }
  resourceContextResult.value.loadWorkflow();
};
