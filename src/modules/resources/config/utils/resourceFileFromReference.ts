import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { ConfigResourceFileSchema } from "../../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceReference } from "../../../../validation/resourceReference/config/schemas/configResourceReference.js";
import type { WorkspaceContext } from "../../../../validation/workspaceContext/schemas/workspaceContext.js";
import { resolveWorkspaceResourceRelativePath } from "../../../workspaceContext/resolveWorkspaceResourcePath.js";

export const configResourceFileFromReference = async (
  resourceReference: ConfigResourceReference,
  workspaceContext: WorkspaceContext,
) => {
  const resourceAbsolutePathReferenceResult = match(resourceReference)
    .with({ type: "absolute" }, ({ filePath }) => ok(filePath))
    .with({ type: "relative" }, ({ filePath }) =>
      match(filePath)
        .with({ format: "json" }, (fp) => {
          return resolveWorkspaceResourceRelativePath(workspaceContext, fp.path).andThen(
            (jsonAbsolutePath) =>
              ok({
                format: fp.format,
                path: jsonAbsolutePath,
              }),
          );
        })
        .with({ format: "yaml" }, (fp) => {
          return resolveWorkspaceResourceRelativePath(workspaceContext, fp.path).andThen(
            (yamlAbsolutePath) =>
              ok({
                format: fp.format,
                path: yamlAbsolutePath,
              }),
          );
        })
        .exhaustive(),
    )
    .exhaustive();
  if (!resourceAbsolutePathReferenceResult.isOk()) {
    return resourceAbsolutePathReferenceResult;
  }
  const resourceAbsolutePathResult = await ConfigResourceFileSchema.safeParseAsync(
    resourceAbsolutePathReferenceResult.value,
  );
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("module_resources_config_utils_resourceFileFromReference_invalidInput", {
        value: resourceAbsolutePathReferenceResult.value.path,
      });
};
