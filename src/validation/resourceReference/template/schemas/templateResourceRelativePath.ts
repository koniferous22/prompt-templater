import z from "zod";

import {
  HandlebarsRelativePathSchema,
  PugRelativePathSchema,
} from "../../../path/schemas/pathWithExtension.js";

export const TemplateResourceRelativePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("pug"),
    path: PugRelativePathSchema,
  }),
  z.object({
    format: z.literal("handlebars"),
    path: HandlebarsRelativePathSchema,
  }),
]);
