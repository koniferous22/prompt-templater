import z from "zod";

import { TemplateResourceAbsolutePathSchema } from "./templateResourceAbsolutePath.js";
import { TemplateResourceRelativePathSchema } from "./templateResourceRelativePath.js";

export const TemplateResourceReferenceSchema = z
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
  .brand<"TemplateResourceReference">();

export type TemplateResourceReference = z.output<typeof TemplateResourceReferenceSchema>;
