import z from "zod";

import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../../path/schemas/pathWithExtension.js";
import { SelectorSchema } from "../../../resourceFile/term/schemas/selector.js";
import { PlainFileTermReferenceOptionsSchema } from "./plainFileReferenceOptions.js";

export const TermResourceAbsolutePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("json"),
    path: JsonAbsolutePathSchema,
    selector: SelectorSchema.nullable(),
  }),
  z.object({
    format: z.literal("yaml"),
    path: YamlAbsolutePathSchema,
    selector: SelectorSchema.nullable(),
  }),
  z.object({
    format: z.literal("plaintext"),
    path: AbsolutePathSchema,
    options: PlainFileTermReferenceOptionsSchema,
  }),
]);

export type TermResourceAbsolutePath = z.output<typeof TermResourceAbsolutePathSchema>;
