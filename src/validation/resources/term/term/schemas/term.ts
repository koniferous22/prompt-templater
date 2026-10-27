import type z from "zod";

import { createTermByTermTypeSchema } from "../factories/termByTermType.js";

export const BooleanTermSchema = createTermByTermTypeSchema("boolean");
export const NumericTermSchema = createTermByTermTypeSchema("number");
export const StringTermSchema = createTermByTermTypeSchema("string");

export type BooleanTerm = z.output<typeof BooleanTermSchema>;
export type NumericTerm = z.output<typeof NumericTermSchema>;
export type StringTerm = z.output<typeof StringTermSchema>;
