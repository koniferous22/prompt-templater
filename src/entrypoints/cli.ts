import { message } from "@optique/core/message";
import { run } from "@optique/run";
import { Err, Ok, ok } from "neverthrow";
import { match } from "ts-pattern";

import { cliArgsParser, type CliArgs } from "../modules/optique/cliArgs.js";
import { envContext } from "../modules/optique/context/env.js";
import { configResourceFileFromAbsolutePath } from "../modules/resources/config/resourceFileFromAbsolutePath.js";
import { configResourceFileFromInput } from "../modules/resources/config/resourceFileFromInput.js";
import { detectWorkspaceContextFromCliInput } from "../modules/workspaceContext/detectWorkspaceContext.js";
import { appErrAsync } from "../utils/deps/neverthrow/errorFactory.js";
import { resultFromOptionalErrorList } from "../utils/deps/neverthrow/optionalErrorList.js";
import type { ConfigResourceInput } from "../validation/schemas/resources/config/utils/configResourceInput.js";
import type { WorkspaceContext } from "../validation/schemas/workspaceContext.js";

type ResolveContextArgs = {
  positionalArgs: Pick<CliArgs["positionalArgs"], "workflow" | "workflowPreset">;
  globalOptions: Pick<CliArgs["globalOptions"], "context">;
};

const createDeferredContext = async (opts: { workflowPreset: ConfigResourceInput | undefined }) => {
  const workflowPreset = await match(opts.workflowPreset)
    .with(undefined, () => undefined)
    .with({ type: "absolute" }, async ({ filePath }) => {
      const result = await configResourceFileFromAbsolutePath(filePath);
      return result.isOk()
        ? {
            type: "resolved" as const,
            value: result.value,
          }
        : {
            type: "rejected" as const,
            error: result.error,
          };
    })
    .with({ type: "relative" }, (value) => ({
      type: "deferred" as const,
      deferred: async (workspaceContext: WorkspaceContext) =>
        await configResourceFileFromInput(value, workspaceContext),
    }))
    .exhaustive();
  if (workflowPreset !== undefined && workflowPreset.type === "rejected") {
    // TODO - apply "resultFromOptionalErrorList" if this were to grow
    return null as any as Err<never, null>;
  }
  return ok({
    workflowPreset,
  });
};

const resolveDeferredContext = async (
  deferredContext: Exclude<
    Awaited<ReturnType<typeof createDeferredContext>>,
    Err<never, null>
  >["value"],
  workspaceContext: WorkspaceContext,
) => {
  const workflowPresetResult = await match(deferredContext.workflowPreset)
    .with(undefined, () => ok(undefined))
    .with({ type: "resolved" }, () => ok(undefined))
    .with({ type: "deferred" }, async ({ deferred }) => await deferred(workspaceContext))
    .exhaustive();
  if (!workflowPresetResult.isOk()) {
    return workflowPresetResult;
  }
  return ok({
    workflowPreset: workflowPresetResult.value,
  });
};

const resolveContext = async ({ positionalArgs, globalOptions }: ResolveContextArgs) => {
  if (globalOptions.context !== undefined) {
    const context = globalOptions.context;
    const workflowResult = await configResourceFileFromInput(positionalArgs.workflow, context);
    const workflowPresetResult =
      positionalArgs.workflowPreset &&
      (await configResourceFileFromInput(positionalArgs.workflowPreset, context));

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
    return ok({
      workspaceContext: globalOptions.context,
      workflow: workflowResult.value,
      workflowPreset: workflowPresetResult?.value ?? undefined,
    });
  }
  if (positionalArgs.workflow.type === "relative") {
    return appErrAsync("entrypoint_cli_unableToDetectContext", {
      workflowFileInput: positionalArgs.workflow.filePath.path,
    });
  }
  // Workflow absolute path is taken as SSOT in case no context has been found
  const workflowAbsolutePath = positionalArgs.workflow.filePath;
  const workflowResult = await configResourceFileFromAbsolutePath(workflowAbsolutePath);
  if (!workflowResult.isOk()) {
    // TODO - new entrypoint exception
    return null as any as Err<never, null>;
  }
  // Defer resource resolution until "workspace context is detected"
  const deferredContextResult = await createDeferredContext({
    workflowPreset: positionalArgs.workflowPreset,
  });
  if (!deferredContextResult.isOk()) {
    return deferredContextResult;
  }
  // Invoke dynamic context detection
  const detectContextResult = await detectWorkspaceContextFromCliInput({
    workflow: workflowResult.value,
    workflowPreset:
      deferredContextResult.value.workflowPreset !== undefined &&
      deferredContextResult.value.workflowPreset.type === "resolved"
        ? deferredContextResult.value.workflowPreset.value
        : undefined,
  });
  if (!detectContextResult.isOk()) {
    return detectContextResult;
  }
  const resolvedDeferredContext = await resolveDeferredContext(
    deferredContextResult.value,
    detectContextResult.value,
  );
  if (!resolvedDeferredContext.isOk()) {
    return resolvedDeferredContext;
  }
  return ok({
    workspaceContext: detectContextResult.value,
    workflow: workflowResult.value,
    workflowPreset: resolvedDeferredContext.value.workflowPreset,
  });
};

export const main = async () => {
  const cliInput = await run(cliArgsParser, {
    programName: "prompt-templater-v1",
    contexts: [envContext],
    help: "option",
    brief: message`Templating clipboard util for making prompt typing more efficient`,
  });
  const resolveContextResult = await resolveContext(cliInput);
  if (!resolveContextResult.isOk()) {
    return resolveContextResult;
  }
  const { workflow, workflowPreset, workspaceContext } = resolveContextResult.value;

  // TODO - perform things within the context
  // 1 - parse the workflow file - part 1-  validate structure
  // * parsing output - generated template render context schema + serialized steps
  // 2 - parse the workflow file - part 2 - validate contents
  // * separate codec - WorkflowFileToWorkflowWithTemplate
  //   * read read template file at this point
  // 3 - run inquirer validators
  // 4 - render + copy to clipboard
  // * add CLI option to render to `stdout` what has been copied
  //   * add env variable configurability
};
