import z from "zod";

import { EditorPromptValidationShorthandSchema } from "../../../../../resourceFragments/validator/codec/shorthands/editorPrompt.js";
import { NonEmptyStringSchema } from "../../../../../string/customTypes/string.js";
import { AbstractWorkflowStepSchema } from "./abstract/abstractWorkflowStep.js";

export const EditorWorkflowStepSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("editor"),
  message: NonEmptyStringSchema,
  validation: EditorPromptValidationShorthandSchema,
});
