import { message } from "@optique/core/message";
import { run } from "@optique/run";
import { Ok, ok } from "neverthrow";

import { cliArgsParser, type CliArgs } from "../modules/optique/cliArgs.js";
import { envContext } from "../modules/optique/context/env.js";
import { configResourceFileFromReference } from "../modules/resources/config/resourceFileFromReference.js";
import { createTemplateContext } from "../modules/templateContext/createTemplateContext.js";
import { createTemplateContextFromDeferredWorkspaceContext } from "../modules/templateContext/createTemplateContextFromDeferredWorkspaceContext.js";
import { appErrAsync } from "../utils/deps/neverthrow/errorFactory.js";
import { resultFromOptionalErrorList } from "../utils/deps/neverthrow/optionalErrorList.js";
import type { WorkspaceContext } from "../validation/workspaceContext/schemas/workspaceContext.js";

type ResolveContextArgs = {
  positionalArgs: Pick<CliArgs["positionalArgs"], "workflow" | "workflowPreset">;
  globalOptions: Pick<CliArgs["globalOptions"], "context">;
};

const resolveTemplateContextFromExplicitWorkspace = async (
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
  const templateContext = createTemplateContext(workspaceContext);
  const addWorkflowResult = await templateContext.addWorkflow(workflowResult.value);
  if (!addWorkflowResult.isOk()) {
    return addWorkflowResult;
  }
  if (workflowPresetResult !== undefined) {
    const addWorkflowPresetResult = await templateContext.addWorkflowPreset(
      workflowPresetResult.value,
    );
    if (!addWorkflowPresetResult.isOk()) {
      return addWorkflowPresetResult;
    }
  }
  return ok(templateContext);
};

const resolveTemplateContext = async ({ positionalArgs, globalOptions }: ResolveContextArgs) => {
  if (globalOptions.context !== undefined) {
    return resolveTemplateContextFromExplicitWorkspace(globalOptions.context, positionalArgs);
  }
  if (positionalArgs.workflow.type === "relative") {
    return appErrAsync("entrypoint_cli_unableToDetectContext", {
      workflowFileInput: positionalArgs.workflow.filePath.path,
    });
  }
  return createTemplateContextFromDeferredWorkspaceContext(positionalArgs.workflow.filePath, {
    workflowPreset: positionalArgs.workflowPreset,
  });
};

export const main = async () => {
  const cliInput = await run(cliArgsParser, {
    programName: "prompt-templater-v1",
    contexts: [envContext],
    help: "option",
    brief: message`Templating clipboard util for making prompt typing more efficient`,
  });
  const templateContextResult = await resolveTemplateContext(cliInput);
  if (!templateContextResult.isOk()) {
    return templateContextResult;
  }
  templateContextResult.value.loadWorkflow();
};
