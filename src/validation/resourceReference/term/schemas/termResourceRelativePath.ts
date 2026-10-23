import z from "zod";

import { RelativePathSchema } from "../../../path/customTypes/index.js";
import {
  JsonRelativePathSchema,
  YamlRelativePathSchema,
} from "../../../path/schemas/pathWithExtension.js";
import { SelectorSchema } from "../../../resourceFile/term/schemas/selector.js";
import { PlainFileTermReferenceOptionsSchema } from "./plainFileReferenceOptions.js";

export const TermResourceRelativePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("json"),
    path: JsonRelativePathSchema,
    selector: SelectorSchema.nullable(),
  }),
  z.object({
    format: z.literal("yaml"),
    path: YamlRelativePathSchema,
    selector: SelectorSchema.nullable(),
  }),
  z.object({
    format: z.literal("plaintext"),
    path: RelativePathSchema,
    options: PlainFileTermReferenceOptionsSchema,
  }),
]);

export type TermResourceRelativePath = z.output<typeof TermResourceRelativePathSchema>;
