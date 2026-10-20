import z from "zod";

import { EditorWorkflowStepSchema } from "../../../../resourceFragments/steps/editor/schemas/editorStep.js";
import { InputWorkflowStepSchema } from "../../../../resourceFragments/steps/input/schemas/inputStep.js";

export const WorkflowStepSchema = z.discriminatedUnion("type", [
  EditorWorkflowStepSchema,
  InputWorkflowStepSchema,
]);
