import { Ok, ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../utils/deps/neverthrow/errorFactory.js";
import { resultFromOptionalErrorList } from "../../utils/deps/neverthrow/optionalErrorList.js";
import type { ConfigResourceInput } from "../../validation/resources/config/schemas/codecUtils/configResourceInput.js";
import type { WorkspaceContext } from "../../validation/workspaceContext/schemas/workspaceContext.js";
import { configResourceFileFromAbsolutePath } from "../resources/config/resourceFileFromAbsolutePath.js";
import { configResourceFileFromInput } from "../resources/config/resourceFileFromInput.js";

export type DeferredContextOpts = {
  workflowPreset: ConfigResourceInput | undefined;
};

// Extract this as utility if this is usable somewhere else
export const createDeferredContext = async (opts: DeferredContextOpts) => {
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
    const errorResult = resultFromOptionalErrorList(
      appErr("module_deferredInputContext_rejectedValue", undefined),
      appErr(workflowPreset.error.code, workflowPreset.error.meta, {
        cause: workflowPreset.error.cause,
        message: workflowPreset.error.message,
      }),
    );
    return errorResult as Exclude<typeof errorResult, Ok<null, never>>;
  }
  const state = {
    workflowPreset,
  };
  const resolveDeferredContext = async (
    deferredContext: typeof state,
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
  return ok({
    getState() {
      return state;
    },
    async resolve(workspaceContext: WorkspaceContext) {
      const result = await resolveDeferredContext(state, workspaceContext);
      return result;
    },
  });
};
