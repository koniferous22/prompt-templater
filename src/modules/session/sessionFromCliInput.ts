import { appErrAsync } from "../../utils/deps/neverthrow/errorFactory.js";
import type { CliArgs } from "../optique/cliArgs.js";
import { createResourceContextFromDeferredWorkspaceContext } from "../resourceContext/createResourceContextFromDeferredWorkspaceContext.js";
import { createResourceContextFromExplicitWorkspace } from "../resourceContext/createResourceContextFromExplicitWorkspace.js";
import { inquirerSessionFactory } from "./inquirer/factories/factory.js";

type ResolveContextArgs = {
  positionalArgs: Pick<CliArgs["positionalArgs"], "workflow" | "workflowPreset">;
  globalOptions: Pick<CliArgs["globalOptions"], "workspaceContext">;
  runCommandOptions: CliArgs["runCommandOptions"];
};

export const resolveResourceContext = async ({
  positionalArgs,
  globalOptions,
}: ResolveContextArgs) => {
  if (globalOptions.workspaceContext !== undefined) {
    return createResourceContextFromExplicitWorkspace(
      globalOptions.workspaceContext,
      positionalArgs,
    );
  }
  if (positionalArgs.workflow.type === "relative") {
    // TODO - change error code
    return appErrAsync("module_session_createSessionFromCliInput_unableToDetectContext", {
      workflowFileInput: positionalArgs.workflow.filePath.path,
    });
  }
  return createResourceContextFromDeferredWorkspaceContext(positionalArgs.workflow.filePath, {
    workflowPreset: positionalArgs.workflowPreset,
  });
};

export const createSessionFromCliInput = async (cliInput: ResolveContextArgs) => {
  const resourceContextResult = await resolveResourceContext(cliInput);
  if (!resourceContextResult.isOk()) {
    return resourceContextResult;
  }
  // todo - add here `match` on multiple session implementations
  return inquirerSessionFactory(
    resourceContextResult.value,
    cliInput.positionalArgs.workflow,
    cliInput.runCommandOptions,
  );
};
