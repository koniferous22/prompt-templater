import z from "zod";

import { NonEmptyStringSchema } from "../../../../../string/customTypes/string.js";

const InputPromptOptionalValidationErrorMessageSchema = z.object({
  typeErrorMessage: NonEmptyStringSchema.optional(),
});

export const InputPromptOptionalValidationErrorMessageShorthandSchema = z.codec(
  z.union([NonEmptyStringSchema.optional(), InputPromptOptionalValidationErrorMessageSchema]),
  InputPromptOptionalValidationErrorMessageSchema,
  {
    decode: (value) => {
      return typeof value === "string" || typeof value === "undefined"
        ? {
            typeErrorMessage: value,
          }
        : value;
    },
    encode: (value) => InputPromptOptionalValidationErrorMessageSchema.parse(value),
  },
);
