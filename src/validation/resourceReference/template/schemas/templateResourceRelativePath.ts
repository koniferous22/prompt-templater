import z from "zod";

import { PugRelativePathSchema } from "../../../path/schemas/pathWithExtension.js";

export const TemplateResourceRelativePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("pug"),
    path: PugRelativePathSchema,
  }),
]);
