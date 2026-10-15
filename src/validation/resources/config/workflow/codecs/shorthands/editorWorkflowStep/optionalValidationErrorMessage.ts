import z from "zod";

import { NonEmptyStringSchema } from "../../../../../../string/customTypes/string.js";

const EditorPromptOptionalValidationErrorMessageSchema = z.object({
  typeErrorMessage: NonEmptyStringSchema.optional(),
});

export const EditorPromptOptionalValidationErrorMessageShorthandSchema = z.codec(
  z.union([NonEmptyStringSchema.optional(), EditorPromptOptionalValidationErrorMessageSchema]),
  EditorPromptOptionalValidationErrorMessageSchema,
  {
    decode: (value) => {
      return typeof value === "string" || typeof value === "undefined"
        ? {
            typeErrorMessage: value,
          }
        : value;
    },
    encode: (value) => EditorPromptOptionalValidationErrorMessageSchema.parse(value),
  },
);
