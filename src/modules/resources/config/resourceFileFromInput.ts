import { join } from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import {
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../../validation/fs/schemas/pathWithExtensions.js";
import { ConfigResourceFileSchema } from "../../../validation/resources/config/codecs/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceInput } from "../../../validation/resources/config/schemas/codecUtils/configResourceInput.js";
import type { WorkspaceContext } from "../../../validation/workspaceContext/schemas/workspaceContext.js";

export const configResourceFileFromInput = async (
  resourceInput: ConfigResourceInput,
  workspaceContext: WorkspaceContext,
) => {
  const resourceAbsolutePathInputResult = match(resourceInput)
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
              })
            : appErr("module_resources_configResourceFileFromInput_invalidInputJsonRelativePath", {
                value: filePath.path,
              });
        })
        .with({ format: "yaml" }, (fp) => {
          const yamlAbsolutePathResult = YamlAbsolutePathSchema.safeParse(
            join(workspaceContext, fp.path),
          );
          return yamlAbsolutePathResult.success
            ? ok({
                format: fp.format,
                path: yamlAbsolutePathResult.data,
              })
            : appErr("module_resources_configResourceFileFromInput_invalidInputYamlRelativePath", {
                value: filePath.path,
              });
        })
        .exhaustive(),
    )
    .exhaustive();
  if (!resourceAbsolutePathInputResult.isOk()) {
    return resourceAbsolutePathInputResult;
  }
  const resourceAbsolutePathResult = await ConfigResourceFileSchema.safeParseAsync(
    resourceAbsolutePathInputResult.value,
  );
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("module_resources_configResourceFileFromInput_invalidInput", {
        value: resourceAbsolutePathInputResult.value.path,
      });
};
