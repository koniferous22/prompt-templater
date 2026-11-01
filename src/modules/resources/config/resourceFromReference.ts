import { ok } from "neverthrow";

import type { ConfigResourceReference } from "../../../validation/resourceReference/config/schemas/configResourceReference.js";
import type { WorkspaceContext } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import type { ConfigResourceType } from "./factories/resourceFactories.js";
import { configResourceFromResourceFile } from "./resourceFromResourceFile.js";
import { configResourceFileFromReference } from "./utils/resourceFileFromReference.js";

export const configResourceFromReference = async <ConfigResourceT extends ConfigResourceType>(
  type: ConfigResourceT,
  resourceReference: ConfigResourceReference,
  workspaceContext: WorkspaceContext,
) => {
  const resourceFileResult = await configResourceFileFromReference(
    resourceReference,
    workspaceContext,
  );
  if (!resourceFileResult.isOk()) {
    return resourceFileResult;
  }
  const resourceResult = await configResourceFromResourceFile(type, resourceFileResult.value);
  if (!resourceResult.isOk()) {
    return resourceResult;
  }
  return ok(resourceResult.value);
};
