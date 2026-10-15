import { ok } from "neverthrow";

import type { TemplateResourceReference } from "../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import type { WorkspaceContext } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { templateResourceFileFromReference } from "./resourceFileFromReference.js";
import { templateResourceFromResourceFile } from "./resourceFromResourceFile.js";

export const templateResourceFromReference = async (
  resourceReference: TemplateResourceReference,
  workspaceContext: WorkspaceContext,
) => {
  const resourceFileResult = await templateResourceFileFromReference(
    resourceReference,
    workspaceContext,
  );
  if (!resourceFileResult.isOk()) {
    return resourceFileResult;
  }
  const resourceResult = await templateResourceFromResourceFile(resourceFileResult.value);
  if (!resourceResult.isOk()) {
    return resourceResult;
  }
  return ok(resourceResult.value);
};
