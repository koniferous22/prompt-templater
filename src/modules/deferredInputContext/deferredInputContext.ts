import { Ok, ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../utils/deps/neverthrow/errorFactory.js";
import { resultFromOptionalErrorList } from "../../utils/deps/neverthrow/optionalErrorList.js";
import type { ConfigResourceReference } from "../../validation/resourceReference/config/schemas/configResourceReference.js";
import type { WorkspaceContext } from "../../validation/workspaceContext/schemas/workspaceContext.js";
import { configResourceFileFromAbsolutePath } from "../resources/config/utils/resourceFileFromAbsolutePath.js";
import { configResourceFileFromReference } from "../resources/config/utils/resourceFileFromReference.js";

export type DeferredContextOpts = {
  workflowPreset: ConfigResourceReference | undefined;
};

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
        await configResourceFileFromReference(value, workspaceContext),
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
  type StateResovedValues = {
    [key in keyof typeof state]: Extract<
      Exclude<(typeof state)[key], undefined>,
      { type: "resolved" }
    >;
  };
  return ok({
    getState() {
      return state;
    },
    getPlainState(): Partial<{
      [key in keyof StateResovedValues]: StateResovedValues[key]["value"];
    }> {
      return Object.fromEntries(
        Object.entries(state)
          .filter(([, value]) => value?.type === "resolved")
          .map(([key, value]) => [
            key,
            (value as Extract<typeof value, { type: "resolved" }>).value,
          ]),
      );
    },
    async resolve(workspaceContext: WorkspaceContext) {
      const result = await resolveDeferredContext(state, workspaceContext);
      return result;
    },
  });
};
