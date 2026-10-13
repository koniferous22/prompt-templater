import { ok } from "neverthrow";

import type { ConfigResourceInput } from "../../../validation/schemas/resources/config/codecUtils/configResourceInput.js";
import type { WorkspaceContext } from "../../../validation/schemas/workspaceContext.js";
import { configResourceFileFromInput } from "./resourceFileFromInput.js";
import { configResourceFromResourceFile } from "./resourceFromResourceFile.js";
import type { ConfigResourceSchemaByResourceType, ConfigResourceType } from "./resourceTypes.js";

export const configResourceFromInput = async <
  ConfigResourceT extends ConfigResourceType,
  ConfigResourceSchema extends ConfigResourceSchemaByResourceType<ConfigResourceT> =
    ConfigResourceSchemaByResourceType<ConfigResourceT>,
>(
  type: ConfigResourceT,
  resourceInput: ConfigResourceInput,
  workspaceContext: WorkspaceContext,
) => {
  const resourceFileResult = await configResourceFileFromInput(resourceInput, workspaceContext);
  if (!resourceFileResult.isOk()) {
    return resourceFileResult;
  }
  const resourceResult = await configResourceFromResourceFile(type, resourceFileResult.value);
  if (!resourceResult.isOk()) {
    return resourceResult;
  }
  return ok(resourceResult.value);
};
