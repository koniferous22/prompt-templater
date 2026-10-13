import z from "zod";

import { JsonRelativePathSchema, YamlRelativePathSchema } from "../path/pathWithExtensions.js";

export const ResourceRelativePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("json"),
    path: JsonRelativePathSchema,
  }),
  z.object({
    format: z.literal("yaml"),
    path: YamlRelativePathSchema,
  }),
]);
