import z from "zod";
import { errorMessages } from "../../constants/errorMessages.js";

export const NonEmptyStringSchema = z.string().nonempty({
  error: (iss) => errorMessages.validation_customTypes_nonEmptyString_invalidInput({ value: String(iss.input) })
})
.brand<'NonEmptyString'>()
