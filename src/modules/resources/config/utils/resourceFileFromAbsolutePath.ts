import { ok } from "neverthrow";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { ConfigResourceFileSchema } from "../../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceAbsolutePath } from "../../../../validation/resourceReference/config/schemas/configResourceAbsolutePath.js";

// Note - utility used in case resource input has been narrowed to absolute path
export const configResourceFileFromAbsolutePath = async (
  resourceAbsolutePath: ConfigResourceAbsolutePath,
) => {
  const resourceAbsolutePathResult =
    await ConfigResourceFileSchema.safeParseAsync(resourceAbsolutePath);
  return resourceAbsolutePathResult.success
    ? ok(resourceAbsolutePathResult.data)
    : appErr("module_resources_config_resourceFileFromAbsolutePath_invalidInput", {
        value: resourceAbsolutePath.path,
      });
};
