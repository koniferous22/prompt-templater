import z from "zod";

import { NonEmptyStringSchema } from "../../../../string/customTypes/string.js";
import { EditorPromptOptionalValidationErrorMessageShorthandSchema } from "./errorMessages/editorPromptOptionalValidation.js";

const EditorPromptRequiredValidationErrorMessageSchema = z.object({
  requiredErrorMessage: NonEmptyStringSchema.optional(),
  typeErrorMessage: NonEmptyStringSchema.optional(),
});

const EditorPromptValidationOutputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("optional"),
    error: EditorPromptOptionalValidationErrorMessageShorthandSchema.optional(),
  }),
  z.object({
    type: z.literal("required"),
    error: EditorPromptRequiredValidationErrorMessageSchema.optional(),
  }),
  z.object({
    type: z.literal("optionalWithDefault"),
    value: NonEmptyStringSchema,
    error: EditorPromptOptionalValidationErrorMessageShorthandSchema.optional(),
  }),
]);

export const EditorPromptValidationShorthandSchema = z.codec(
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
