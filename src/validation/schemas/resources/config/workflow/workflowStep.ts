import z from "zod";

import { EditorWorkflowStepSchema } from "./workflowStep/editor.js";
import { InputWorkflowStepSchema } from "./workflowStep/input.js";

export const WorkflowStepSchema = z.discriminatedUnion("type", [
  EditorWorkflowStepSchema,
  InputWorkflowStepSchema,
]);
