import z from "zod";

import { TemplateResourceAbsolutePathSchema } from "./templateResourceAbsolutePath.js";
import { TemplateResourceRelativePathSchema } from "./templateResourceRelateivePath.js";

export const TemplateResourceInputSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("absolute"),
      filePath: TemplateResourceAbsolutePathSchema,
    }),
    z.object({
      type: z.literal("relative"),
      filePath: TemplateResourceRelativePathSchema,
    }),
  ])
  .brand<"TemplateResourceInput">();

export type TemplateResourceInput = z.output<typeof TemplateResourceInputSchema>;
