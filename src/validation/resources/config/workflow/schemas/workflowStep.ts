import z from "zod";

import { EditorWorkflowStepSchema } from "../../../../resourceFragments/steps/editor/schemas/editorWorkflowStep.js";
import { InputWorkflowStepSchema } from "../../../../resourceFragments/steps/input/schemas/inputWorkflowStep.js";
import { SelectWorkflowStepSchema } from "../../../../resourceFragments/steps/select/codecs/selectWorkflowStep.js";

export const WorkflowStepSchema = z.discriminatedUnion("type", [
  EditorWorkflowStepSchema,
  InputWorkflowStepSchema,
  SelectWorkflowStepSchema,
]);
