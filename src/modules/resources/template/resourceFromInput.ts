import { ok } from "neverthrow";

import type { TemplateResourceInput } from "../../../validation/resources/template/schemas/templateResourceInput.js";
import type { WorkspaceContext } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { templateResourceFileFromInput } from "./resourceFileFromInput.js";
import { templateResourceFromResourceFile } from "./resourceFromResourceFile.js";

export const templateResourceFromInput = async (
  resourceInput: TemplateResourceInput,
  workspaceContext: WorkspaceContext,
) => {
  const resourceFileResult = await templateResourceFileFromInput(resourceInput, workspaceContext);
  if (!resourceFileResult.isOk()) {
    return resourceFileResult;
  }
  const resourceResult = await templateResourceFromResourceFile(resourceFileResult.value);
  if (!resourceResult.isOk()) {
    return resourceResult;
  }
  return ok(resourceResult.value);
};
