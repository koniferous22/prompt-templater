import z from "zod";

import { NonNegativeIntegerSchema } from "../../../number/customTypes/number.js";
import { RelativePathSchema } from "../../../path/customTypes/index.js";
import {
  JsonRelativePathSchema,
  YamlRelativePathSchema,
} from "../../../path/schemas/pathWithExtension.js";
import { NonEmptyStringSchema } from "../../../string/customTypes/string.js";

export const TermResourceRelativePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("json"),
    path: JsonRelativePathSchema,
    selector: z.array(z.union([NonEmptyStringSchema, NonNegativeIntegerSchema])).nullable(),
  }),
  z.object({
    format: z.literal("yaml"),
    path: YamlRelativePathSchema,
    selector: z.array(z.union([NonEmptyStringSchema, NonNegativeIntegerSchema])).nullable(),
  }),
  z.object({
    format: z.literal("plaintext"),
    path: RelativePathSchema,
  }),
]);

export type TermResourceRelativePath = z.output<typeof TermResourceRelativePathSchema>;
