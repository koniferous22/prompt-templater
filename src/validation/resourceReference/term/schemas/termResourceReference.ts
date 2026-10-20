import z from "zod";

import { TermResourceAbsolutePathSchema } from "./termResourceAbsolutePath.js";
import { TermResourceRelativePathSchema } from "./termResourceRelativePath.js";

export const TermResourceReferenceSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("absolute"),
      filePath: TermResourceAbsolutePathSchema,
    }),
    // Resources, such as workflow can be specified by relative path in case "workspace context" is specified
    z.object({
      type: z.literal("relative"),
      filePath: TermResourceRelativePathSchema,
    }),
  ])
  .brand<"TermResourceReference">();

export type TermResourceReference = z.output<typeof TermResourceReferenceSchema>;
