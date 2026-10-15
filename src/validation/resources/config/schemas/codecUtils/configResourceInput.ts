import z from "zod";

import { ConfigResourceAbsolutePathSchema } from "./configResourceAbsolutePath.js";
import { ConfigResourceRelativePathSchema } from "./configResourceRelativePath.js";

export const ConfigResourceInputSchema = z
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
  .brand<"ConfigResourceInput">();

export type ConfigResourceInput = z.output<typeof ConfigResourceInputSchema>;
