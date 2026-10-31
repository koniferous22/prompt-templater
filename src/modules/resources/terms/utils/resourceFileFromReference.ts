import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { TermResourceFileSchema } from "../../../../validation/resourceFile/term/codecs/resourceAbsolutePathToResourceFile.js";
import type { TermResourceReference } from "../../../../validation/resourceReference/term/schemas/termResourceReference.js";
import type { WorkspaceContext } from "../../../../validation/workspaceContext/schemas/workspaceContext.js";
import { resolveWorkspaceResourceRelativePath } from "../../../workspaceContext/resolveWorkspaceResourcePath.js";

export const termResourceFileFromReference = async (
  resourceReference: TermResourceReference,
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
                selector: fp.selector,
              }),
          );
        })
        .with({ format: "yaml" }, (fp) => {
          return resolveWorkspaceResourceRelativePath(workspaceContext, fp.path).andThen(
            (yamlAbsolutePath) =>
              ok({
                format: fp.format,
                path: yamlAbsolutePath,
                selector: fp.selector,
              }),
          );
        })
        .with({ format: "plaintext" }, (fp) => {
          return resolveWorkspaceResourceRelativePath(workspaceContext, fp.path).andThen(
            (plaintextAbsolutePath) =>
              ok({
                format: fp.format,
                path: plaintextAbsolutePath,
                options: fp.options,
              }),
          );
        })
        .exhaustive(),
    )
    .exhaustive();
  if (!resourceAbsolutePathReferenceResult.isOk()) {
    return resourceAbsolutePathReferenceResult;
  }
  const resourceAbsolutePathResult = await TermResourceFileSchema.safeParseAsync(
    resourceAbsolutePathReferenceResult.value,
  );
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("module_resources_term_utils_resourceFileFromReference_invalidInput", {
        value: resourceAbsolutePathReferenceResult.value.path,
      });
};
