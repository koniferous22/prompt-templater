import z from "zod";

import {
  HandlebarsAbsolutePathSchema,
  PugAbsolutePathSchema,
} from "../../../path/schemas/pathWithExtension.js";

export const TemplateResourceAbsolutePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("pug"),
    path: PugAbsolutePathSchema,
  }),
  z.object({
    format: z.literal("handlebars"),
    path: HandlebarsAbsolutePathSchema,
  }),
]);

export type TemplateResourceAbsolutePath = z.output<typeof TemplateResourceAbsolutePathSchema>;
