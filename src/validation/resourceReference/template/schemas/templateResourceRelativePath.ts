import z from "zod";

import { HandlebarsRelativePathSchema } from "../../../path/schemas/pathWithExtension.js";

export const TemplateResourceRelativePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("handlebars"),
    path: HandlebarsRelativePathSchema,
  }),
]);

export type TemplateResourceRelativePath = z.output<typeof TemplateResourceRelativePathSchema>;
