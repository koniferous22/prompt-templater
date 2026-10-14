import { ok } from "neverthrow";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import { ConfigResourceFileSchema } from "../../../validation/codecs/configResource/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceAbsolutePath } from "../../../validation/schemas/resources/config/codecUtils/configResourceAbsolutePath.js";

// Note - utility used in case resource input has been narrowed to absolute path
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
