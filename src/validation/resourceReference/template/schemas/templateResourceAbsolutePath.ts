import z from "zod";

import { PugAbsolutePathSchema } from "../../../path/schemas/pathWithExtension.js";

export const TemplateResourceAbsolutePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("pug"),
    path: PugAbsolutePathSchema,
  }),
]);

export type TemplateResourceAbsolutePath = z.output<typeof TemplateResourceAbsolutePathSchema>;
