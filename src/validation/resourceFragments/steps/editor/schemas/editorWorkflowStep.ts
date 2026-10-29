import z from "zod";

import { NonEmptyStringSchema } from "../../../../string/customTypes/string.js";
import { EditorPromptValidationShorthandSchema } from "../../../validator/codec/shorthands/editorPrompt.js";
import { AbstractWorkflowStepSchema } from "../../abstract/schemas/abstractWorkflowStep.js";

export const EditorWorkflowStepSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("editor"),
  message: NonEmptyStringSchema,
  validation: EditorPromptValidationShorthandSchema,
});

export type EditorWorkflowStep = z.output<typeof EditorWorkflowStepSchema>;
