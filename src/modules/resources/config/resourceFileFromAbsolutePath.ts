import { ok } from "neverthrow";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import { ConfigResourceFileSchema } from "../../../validation/codecs/configResource/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceAbsolutePath } from "../../../validation/schemas/resources/configResourceAbsolutePath.js";

export const configResourceFileFromAbsolutePath = async (
  resourceAbsolutePath: ConfigResourceAbsolutePath,
) => {
  const resourceAbsolutePathResult =
    await ConfigResourceFileSchema.safeParseAsync(resourceAbsolutePath);
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("module_resources_configResourceFileFromAbsolutePath_invalidInput", {
        value: resourceAbsolutePath.path,
      });
};
