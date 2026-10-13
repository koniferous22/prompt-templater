import z from "zod";

import { JsonAbsolutePathSchema, YamlAbsolutePathSchema } from "../path/pathWithExtensions.js";

export const ResourceAbsolutePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("json"),
    path: JsonAbsolutePathSchema,
  }),
  z.object({
    format: z.literal("yaml"),
    path: YamlAbsolutePathSchema,
  }),
]);

export type ResourceAbsolutePath = z.output<typeof ResourceAbsolutePathSchema>;
