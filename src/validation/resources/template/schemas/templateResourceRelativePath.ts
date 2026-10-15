import z from "zod";

import { PugRelativePathSchema } from "../../../fs/schemas/pathWithExtensions.js";

export const TemplateResourceRelativePathSchema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("pug"),
    path: PugRelativePathSchema,
  }),
]);
