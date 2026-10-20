import z from "zod";

import { errorMessages } from "../../../constants/errorMessages.js";

export const NonNegativeIntegerSchema = z
  .int()
  .nonnegative({
    error: (iss) =>
      errorMessages.validation_number_customTypes_nonNegativeInteger_invalidInput({
        value: String(iss.input),
      }),
  })
  .brand<"NonNegativeIntegerSchema">();

export type NonNegativeInteger = z.output<typeof NonNegativeIntegerSchema>;
