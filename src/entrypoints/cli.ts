import { join } from "node:path";

import { message } from "@optique/core/message";
import { run } from "@optique/run";
import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { cliArgsParser, type CliArgs } from "../modules/optique/cliArgs.js";
import { envContext } from "../modules/optique/context/env.js";
import { detectWorkspaceContextFromCliInput } from "../modules/workspaceContext/detectWorkspaceContext.js";
import {
  appAggregateErrAsync,
  appErrAsync,
  createError,
} from "../utils/deps/neverthrow/errorFactory.js";
import { AbsolutePathSchema, type AbsolutePath } from "../validation/customTypes/path.js";
import { FileSchema } from "../validation/schemas/file.js";

type ResolveContextArgs = {
  positionalArgs: Pick<CliArgs["positionalArgs"], "workflow" | "workflowPreset">;
  globalOptions: Pick<CliArgs["globalOptions"], "context">;
};

const validateInputFiles = async (inputFiles: {
  workflow: AbsolutePath;
  workflowPreset?: AbsolutePath | undefined;
}) => {
  const workflowResult = await FileSchema.safeParseAsync(inputFiles.workflow);
  const workflowPresetResult =
    inputFiles.workflowPreset && (await FileSchema.safeParseAsync(inputFiles.workflowPreset));
  if (workflowPresetResult === undefined) {
    return workflowResult.success
      ? ok({
          workflow: workflowResult.data,
          workflowPreset: undefined,
        })
      : appErrAsync(
          "entrypoint_cli_positionalArgumentNotFile",
          {
            path: AbsolutePathSchema.parse(inputFiles.workflowPreset),
            type: "workflow",
          },
          {
            cause: workflowResult.error,
          },
        );
  }
  return match([workflowResult, workflowPresetResult])
    .with(
      [{ success: true }, { success: true }],
      ([{ data: workflow }, { data: workflowPreset }]) => {
        return ok({
          workflow,
          workflowPreset,
        });
      },
    )
    .with([{ success: true }, { success: false }], ([, { error: workflowPresetError }]) => {
      return appErrAsync(
        "entrypoint_cli_positionalArgumentNotFile",
        {
          path: AbsolutePathSchema.parse(inputFiles.workflowPreset),
          type: "workflow preset",
        },
        {
          cause: workflowPresetError,
        },
      );
    })
    .with([{ success: false }, { success: true }], ([{ error: workflowError }]) => {
      return appErrAsync(
        "entrypoint_cli_positionalArgumentNotFile",
        {
          path: AbsolutePathSchema.parse(inputFiles.workflowPreset),
          type: "workflow",
        },
        {
          cause: workflowError,
        },
      );
    })
    .with(
      [{ success: false }, { success: false }],
      ([{ error: workflowError }, { error: workflowPresetError }]) => {
        return appAggregateErrAsync(
          createError(
            "entrypoint_cli_positionalArgumentNotFile",
            {
              path: AbsolutePathSchema.parse(inputFiles.workflowPreset),
              type: "workflow preset",
            },
            {
              cause: workflowPresetError,
            },
          ),
          createError(
            "entrypoint_cli_positionalArgumentNotFile",
            {
              path: AbsolutePathSchema.parse(inputFiles.workflowPreset),
              type: "workflow",
            },
            {
              cause: workflowError,
            },
          ),
        );
      },
    )
    .exhaustive();
};

const resolveContext = async ({ positionalArgs, globalOptions }: ResolveContextArgs) => {
  if (globalOptions.context !== undefined) {
    const context = globalOptions.context;
    const workflowPath = match(positionalArgs.workflow)
      .with({ type: "absolute" }, ({ path }) => path)
      .with({ type: "relative" }, ({ path }) => AbsolutePathSchema.parse(join(context, path)))
      .exhaustive();
    const workflowPresetPath =
      positionalArgs.workflowPreset &&
      match(positionalArgs.workflowPreset)
        .with({ type: "absolute" }, ({ path }) => path)
        .with({ type: "relative" }, ({ path }) => AbsolutePathSchema.parse(join(context, path)))
        .exhaustive();
    const validateInputFilesResult = await validateInputFiles({
      workflow: workflowPath,
      workflowPreset: workflowPresetPath,
    });
    if (!validateInputFilesResult.isOk()) {
      return validateInputFilesResult;
    }
    const { workflow, workflowPreset } = validateInputFilesResult.value;
    return ok({
      context: globalOptions.context,
      workflow,
      workflowPreset,
    });
  }
  if (positionalArgs.workflow.type === "relative") {
    return appErrAsync("entrypoint_cli_unableToDetectContext", {
      workflowFileInput: positionalArgs.workflow.path,
    });
  }
  // Workflow absolute path is taken as SSOT in case no context has been found
  const workflowAbsolutePath = positionalArgs.workflow.path;
  const validateInputFilesResult = await validateInputFiles({
    workflow: workflowAbsolutePath,
    workflowPreset:
      positionalArgs.workflowPreset !== undefined &&
      positionalArgs.workflowPreset.type === "absolute"
        ? positionalArgs.workflowPreset.path
        : undefined,
  });
  if (!validateInputFilesResult.isOk()) {
    return validateInputFilesResult;
  }
  const { workflow, workflowPreset } = validateInputFilesResult.value;
  // Invoke dynamic context detection
  const detectContextResult = await detectWorkspaceContextFromCliInput({
    workflow,
    workflowPreset,
  });
  if (!detectContextResult.isOk()) {
    return detectContextResult;
  }
  return ok({
    context: detectContextResult.value,
    workflow,
    workflowPreset,
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
  console.log(JSON.stringify(cliInput, null, 2));
  // TODO - perform things within the context
  // 1 - parse the workflow file
};
