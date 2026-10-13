import z from "zod";

import { ResourceAbsolutePathSchema } from "./resourceAbsolutePath.js";
import { ResourceRelativePathSchema } from "./resourceRelativePath.js";

export const ResourceUserInputSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("absolute"),
      filePath: ResourceAbsolutePathSchema,
    }),
    // Resources, such as workflow can be specified by relative path in case "workspace context" is specified
    z.object({
      type: z.literal("relative"),
      filePath: ResourceRelativePathSchema,
    }),
  ])
  .brand<"ResourceUserInput">();

export type ResourceUserInput = z.output<typeof ResourceUserInputSchema>;
