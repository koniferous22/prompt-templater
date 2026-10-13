import z from "zod";

import { JsonAbsolutePathSchema, YamlAbsolutePathSchema } from "../path/pathWithExtensions.js";

export const ConfigResourceAbsolutePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("json"),
    path: JsonAbsolutePathSchema,
  }),
  z.object({
    format: z.literal("yaml"),
    path: YamlAbsolutePathSchema,
  }),
]);

export type ConfigResourceAbsolutePath = z.output<typeof ConfigResourceAbsolutePathSchema>;
