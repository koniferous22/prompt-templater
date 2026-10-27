import { ok } from "neverthrow";

import type { TermResourceReference } from "../../../validation/resourceReference/term/schemas/termResourceReference.js";
import type { TermValueType } from "../../../validation/resources/term/term/factories/termByTermType.js";
import type { WorkspaceContext } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { termResourceFromResourceFile } from "./resourceFromResourceFile.js";
import { termResourceFileFromReference } from "./utils/resourceFileFromReference.js";

export const termResourceFromReference = async <TermType extends TermValueType>(
  resourceReference: TermResourceReference,
  workspaceContext: WorkspaceContext,
  termType: TermType,
) => {
  const resourceFileResult = await termResourceFileFromReference(
    resourceReference,
    workspaceContext,
  );
  if (!resourceFileResult.isOk()) {
    return resourceFileResult;
  }
  const resourceResult = await termResourceFromResourceFile(resourceFileResult.value, termType);
  if (!resourceResult.isOk()) {
    return resourceResult;
  }
  return ok(resourceResult.value);
};
