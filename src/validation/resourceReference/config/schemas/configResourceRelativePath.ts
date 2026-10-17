import z from "zod";

import {
  JsonRelativePathSchema,
  YamlRelativePathSchema,
} from "../../../path/schemas/pathWithExtension.js";

export const ConfigResourceRelativePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("json"),
    path: JsonRelativePathSchema,
  }),
  z.object({
    format: z.literal("yaml"),
    path: YamlRelativePathSchema,
  }),
]);

export type ConfigResourceRelativePath = z.output<typeof ConfigResourceRelativePathSchema>;
