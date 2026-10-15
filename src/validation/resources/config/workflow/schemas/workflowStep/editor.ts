import z from "zod";

import { NonEmptyStringSchema } from "../../../../../string/customTypes/string.js";
import { AbstractWorkflowStepSchema } from "./abstract/abstractWorkflowStep.js";
import { EditorPromptValidationShorthandSchema } from "../../codecs/shorthands/editorWorkflowStep/validation.js";

export const EditorWorkflowStepSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("editor"),
  message: NonEmptyStringSchema,
  validation: EditorPromptValidationShorthandSchema,
});
