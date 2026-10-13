import z from "zod";

import { ConfigResourceAbsolutePathSchema } from "./configResourceAbsolutePath.js";
import { ConfigResourceRelativePathSchema } from "./configResourceRelativePath.js";

export const ConfigResourceUserInputSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("absolute"),
      filePath: ConfigResourceAbsolutePathSchema,
    }),
    // Resources, such as workflow can be specified by relative path in case "workspace context" is specified
    z.object({
      type: z.literal("relative"),
      filePath: ConfigResourceRelativePathSchema,
    }),
  ])
  .brand<"ConfigResourceUserInput">();

export type ConfigResourceUserInput = z.output<typeof ConfigResourceUserInputSchema>;
