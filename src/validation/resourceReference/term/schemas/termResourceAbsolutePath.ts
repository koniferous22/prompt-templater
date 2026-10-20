import z from "zod";

import { NonNegativeIntegerSchema } from "../../../number/customTypes/number.js";
import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../../path/schemas/pathWithExtension.js";
import { NonEmptyStringSchema } from "../../../string/customTypes/string.js";

export const TermResourceAbsolutePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("json"),
    path: JsonAbsolutePathSchema,
    selector: z.array(z.union([NonEmptyStringSchema, NonNegativeIntegerSchema])).nullable(),
  }),
  z.object({
    format: z.literal("yaml"),
    path: YamlAbsolutePathSchema,
    selector: z.array(z.union([NonEmptyStringSchema, NonNegativeIntegerSchema])).nullable(),
  }),
  z.object({
    format: z.literal("plaintext"),
    path: AbsolutePathSchema,
  }),
]);

export type TermResourceAbsolutePath = z.output<typeof TermResourceAbsolutePathSchema>;
