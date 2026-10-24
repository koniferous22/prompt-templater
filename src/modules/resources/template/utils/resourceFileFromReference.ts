import { join } from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { HandlebarsAbsolutePathSchema } from "../../../../validation/path/schemas/pathWithExtension.js";
import { TemplateResourceFileSchema } from "../../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import type { TemplateResourceReference } from "../../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import type { WorkspaceContext } from "../../../../validation/workspaceContext/schemas/workspaceContext.js";

export const templateResourceFileFromReference = async (
  resourceReference: TemplateResourceReference,
  workspaceContext: WorkspaceContext,
) => {
  const resourceAbsolutePathReferenceResult = match(resourceReference)
    .with({ type: "absolute" }, ({ filePath }) => ok(filePath))
    .with({ type: "relative" }, ({ filePath }) =>
      match(filePath)
        .with({ format: "handlebars" }, (fp) => {
          const handlebarsAbsolutePathResult = HandlebarsAbsolutePathSchema.safeParse(
            join(workspaceContext, fp.path),
          );
          return handlebarsAbsolutePathResult.success
            ? ok({
                format: fp.format,
                path: handlebarsAbsolutePathResult.data,
              })
            : appErr(
                "module_resources_template_resourceFileFromReference_invalidInputHandlebarsRelativePath",
                {
                  value: filePath.path,
                },
              );
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
    : appErr("module_resources_template_resourceFileFromReference_invalidInput", {
        value: resourceAbsolutePathReferenceResult.value.path,
      });
};
