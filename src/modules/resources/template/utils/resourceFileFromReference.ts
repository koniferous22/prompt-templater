import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { TemplateResourceFileSchema } from "../../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import type { TemplateResourceReference } from "../../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import type { WorkspaceContext } from "../../../../validation/workspaceContext/schemas/workspaceContext.js";
import { resolveWorkspaceResourceRelativePath } from "../../../workspaceContext/resolveWorkspaceResourcePath.js";

export const templateResourceFileFromReference = async (
  resourceReference: TemplateResourceReference,
  workspaceContext: WorkspaceContext,
) => {
  const resourceAbsolutePathReferenceResult = match(resourceReference)
    .with({ type: "absolute" }, ({ filePath }) => ok(filePath))
    .with({ type: "relative" }, ({ filePath }) =>
      match(filePath)
        .with({ format: "handlebars" }, (fp) => {
          return resolveWorkspaceResourceRelativePath(workspaceContext, fp.path).andThen(
            (handlebarsAbsolutePath) =>
              ok({
                format: fp.format,
                path: handlebarsAbsolutePath,
              }),
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
