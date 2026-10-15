import { join } from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import { PugAbsolutePathSchema } from "../../../validation/path/schemas/pathWithExtensions.js";
import { TemplateResourceFileSchema } from "../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import type { TemplateResourceReference } from "../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import type { WorkspaceContext } from "../../../validation/workspaceContext/schemas/workspaceContext.js";

export const templateResourceFileFromReference = async (
  resourceReference: TemplateResourceReference,
  workspaceContext: WorkspaceContext,
) => {
  const resourceAbsolutePathReferenceResult = match(resourceReference)
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
  if (!resourceAbsolutePathReferenceResult.isOk()) {
    return resourceAbsolutePathReferenceResult;
  }
  const resourceAbsolutePathResult = await TemplateResourceFileSchema.safeParseAsync(
    resourceAbsolutePathReferenceResult.value,
  );
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("module_resources_templateResourceFileFromInput_invalidInput", {
        value: resourceAbsolutePathReferenceResult.value.path,
      });
};
