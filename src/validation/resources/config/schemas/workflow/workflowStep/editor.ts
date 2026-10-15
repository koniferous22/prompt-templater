import z from "zod";

import { NonEmptyStringSchema } from "../../../../../string/customTypes/string.js";
import { AbstractWorkflowStepSchema } from "./abstract/abstractWorkflowStep.js";

const EditorPromptValidationOutputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("optional"),
  }),
  z.object({
    type: z.literal("required"),
  }),
  z.object({
    type: z.literal("optionalWithDefault"),
    value: NonEmptyStringSchema,
  }),
]);

const EditorPromptValidationSchema = z.codec(
  z.union([z.literal("optional"), z.literal("required"), EditorPromptValidationOutputSchema]),
  EditorPromptValidationOutputSchema,
  {
    decode: (value) => {
      return typeof value === "string"
        ? {
            type: value,
          }
        : value;
    },
    encode: (value) => EditorPromptValidationOutputSchema.parse(value),
  },
);

export const EditorWorkflowStepSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("editor"),
  message: NonEmptyStringSchema,
  validation: EditorPromptValidationSchema,
});
