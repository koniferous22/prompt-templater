import { join } from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../utils/deps/neverthrow/errorFactory.js";
import {
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../validation/schemas/path/pathWithExtensions.js";
import { ConfigResourceAbsolutePathSchema } from "../../validation/schemas/resources/configResourceAbsolutePath.js";
import type { ConfigResourceInput } from "../../validation/schemas/resources/configResourceInput.js";
import type { WorkspaceContext } from "../../validation/schemas/workspaceContext.js";

export const configResourceAbsolutePathFromInput = (
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
            : appErr(
                "validation_schemas_resourceAbsolutePathFromUserInput_invalidInputJsonRelativePath",
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
              })
            : appErr(
                "validation_schemas_resourceAbsolutePathFromUserInput_invalidInputYamlRelativePath",
                {
                  value: filePath.path,
                },
              );
        })
        .exhaustive(),
    )
    .exhaustive();
  if (!resourceAbsolutePathInputResult.isOk()) {
    return resourceAbsolutePathInputResult;
  }
  const resourceAbsolutePathResult = ConfigResourceAbsolutePathSchema.safeParse(
    resourceAbsolutePathInputResult.value,
  );
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("validation_schemas_resourceAbsolutePathFromUserInput_invalidInput", {
        value: resourceAbsolutePathInputResult.value.path,
      });
};
