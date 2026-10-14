import { message } from "@optique/core/message";
import { run } from "@optique/run";
import { Err, Ok, ok } from "neverthrow";

import {
  createDeferredContext,
  type DeferredContextOpts,
} from "../modules/deferredInputContext/deferredInputContext.js";
import { cliArgsParser, type CliArgs } from "../modules/optique/cliArgs.js";
import { envContext } from "../modules/optique/context/env.js";
import { configResourceFileFromAbsolutePath } from "../modules/resources/config/resourceFileFromAbsolutePath.js";
import { configResourceFileFromInput } from "../modules/resources/config/resourceFileFromInput.js";
import { createTemplateContext } from "../modules/templateContext/createTemplateContext.js";
import { detectWorkspaceContextFromCliInput } from "../modules/workspaceContext/detectWorkspaceContext.js";
import { appErrAsync } from "../utils/deps/neverthrow/errorFactory.js";
import { resultFromOptionalErrorList } from "../utils/deps/neverthrow/optionalErrorList.js";
import type { ConfigResourceAbsolutePath } from "../validation/schemas/resources/config/codecUtils/configResourceAbsolutePath.js";
import type { WorkspaceContext } from "../validation/schemas/workspaceContext.js";

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
  const workflowResult = await configResourceFileFromInput(workflow, workspaceContext);
  const workflowPresetResult =
    workflowPreset && (await configResourceFileFromInput(workflowPreset, workspaceContext));

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

const resolveTemplateContextFromWorkflowPath = async (
  workflowResourcePath: ConfigResourceAbsolutePath,
  deferredContextOpts: DeferredContextOpts,
) => {
  // Workflow absolute path is taken as SSOT in case no context has been found
  const workflowAbsolutePath = workflowResourcePath;
  const workflowResult = await configResourceFileFromAbsolutePath(workflowAbsolutePath);
  if (!workflowResult.isOk()) {
    return appErrAsync("entrypoint_cli_invalidWorkflowPath", {
      workflowFileInput: workflowAbsolutePath.path,
    });
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
  return resolveTemplateContextFromWorkflowPath(positionalArgs.workflow.filePath, {
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
