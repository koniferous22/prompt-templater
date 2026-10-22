import z from "zod";

import { NonNegativeIntegerSchema } from "../../../number/customTypes/number.js";
import { NonEmptyStringSchema } from "../../../string/customTypes/string.js";

export const SelectorSchema = z.array(z.union([NonEmptyStringSchema, NonNegativeIntegerSchema]));
export type Selector = z.output<typeof SelectorSchema>;
