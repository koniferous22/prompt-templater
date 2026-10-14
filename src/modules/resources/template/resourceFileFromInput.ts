import { join } from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import { TemplateResourceFileSchema } from "../../../validation/codecs/templateResource/resourceAbsolutePathToResourceFile.js";
import { PugAbsolutePathSchema } from "../../../validation/schemas/path/pathWithExtensions.js";
import type { TemplateResourceInput } from "../../../validation/schemas/resources/template/templateResourceInput.js";
import type { WorkspaceContext } from "../../../validation/schemas/workspaceContext.js";

export const templateResourceFileFromInput = async (
  resourceInput: TemplateResourceInput,
  workspaceContext: WorkspaceContext,
) => {
  const resourceAbsolutePathInputResult = match(resourceInput)
    .with({ type: "absolute" }, ({ filePath }) => ok(filePath))
    .with({ type: "relative" }, ({ filePath }) =>
      match(filePath)
        .with({ format: "pug" }, (fp) => {
          const pugAbsolutePathResult = PugAbsolutePathSchema.safeParse(
            join(workspaceContext, fp.path),
          );
          return pugAbsolutePathResult.success
            ? ok({
                format: fp.format,
                path: pugAbsolutePathResult.data,
              })
            : appErr("module_resources_templateResourceFileFromInput_invalidInputPugRelativePath", {
                value: filePath.path,
              });
        })
        .exhaustive(),
    )
    .exhaustive();
  if (!resourceAbsolutePathInputResult.isOk()) {
    return resourceAbsolutePathInputResult;
  }
  const resourceAbsolutePathResult = await TemplateResourceFileSchema.safeParseAsync(
    resourceAbsolutePathInputResult.value,
  );
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("module_resources_templateResourceFileFromInput_invalidInput", {
        value: resourceAbsolutePathInputResult.value.path,
      });
};
