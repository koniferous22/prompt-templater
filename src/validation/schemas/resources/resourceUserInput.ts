import z from "zod";

import {
  JsonAbsolutePathSchema,
  JsonRelativePathSchema,
  YamlAbsolutePathSchema,
  YamlRelativePathSchema,
} from "../path/pathWithExtensions.js";

export const ResourceUserInputSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("absolute"),
      path: z.union([JsonAbsolutePathSchema, YamlAbsolutePathSchema]),
    }),
    // Resources, such as workflow can be specified by relative path in case "workspace context" is specified
    z.object({
      type: z.literal("relative"),
      path: z.union([JsonRelativePathSchema, YamlRelativePathSchema]),
    }),
  ])
  .brand<"ResourceUserInput">();
