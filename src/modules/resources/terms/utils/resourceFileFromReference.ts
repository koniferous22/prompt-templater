import { join } from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import {
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../../../validation/path/schemas/pathWithExtension.js";
import { TermResourceFileSchema } from "../../../../validation/resourceFile/term/codecs/resourceAbsolutePathToResourceFile.js";
import type { TermResourceReference } from "../../../../validation/resourceReference/term/schemas/termResourceReference.js";
import type { WorkspaceContext } from "../../../../validation/workspaceContext/schemas/workspaceContext.js";

export const termResourceFileFromReference = async (
  resourceReference: TermResourceReference,
  workspaceContext: WorkspaceContext,
) => {
  const resourceAbsolutePathReferenceResult = match(resourceReference)
    .with({ type: "absolute" }, ({ filePath }) => ok(filePath))
    .with({ type: "relative" }, ({ filePath }) =>
      match(filePath)
        .with({ format: "json" }, (fp) => {
          const jsonAbsolutePathResult = JsonAbsolutePathSchema.safeParse(
            join(workspaceContext, fp.path),
          );
          return jsonAbsolutePathResult.success
            ? ok({
                format: fp.format,
                path: jsonAbsolutePathResult.data,
                selector: fp.selector,
              })
            : appErr(
                "module_resources_term_utils_resourceFileFromReference_invalidInputJsonRelativePath",
                {
                  value: filePath.path,
                },
              );
        })
        .with({ format: "yaml" }, (fp) => {
          const yamlAbsolutePathResult = YamlAbsolutePathSchema.safeParse(
            join(workspaceContext, fp.path),
          );
          return yamlAbsolutePathResult.success
            ? ok({
                format: fp.format,
                path: yamlAbsolutePathResult.data,
                selector: fp.selector,
              })
            : appErr(
                "module_resources_term_utils_resourceFileFromReference_invalidInputYamlRelativePath",
                {
                  value: filePath.path,
                },
              );
        })
        .with({ format: "plaintext" }, (fp) => {
          const yamlAbsolutePathResult = AbsolutePathSchema.safeParse(
            join(workspaceContext, fp.path),
          );
          return yamlAbsolutePathResult.success
            ? ok({
                format: fp.format,
                path: yamlAbsolutePathResult.data,
                options: fp.options,
              })
            : appErr(
                "module_resources_term_utils_resourceFileFromReference_invalidInputPlaintextRelativePath",
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
  const resourceAbsolutePathResult = await TermResourceFileSchema.safeParseAsync(
    resourceAbsolutePathReferenceResult.value,
  );
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("module_resources_term_utils_resourceFileFromReference_invalidInput", {
        value: resourceAbsolutePathReferenceResult.value.path,
      });
};
