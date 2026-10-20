import z from "zod";

import { AbsolutePathSchema, RelativePathSchema } from "../../path/customTypes/index.js";

export const DirentFlagsSchema = z.object({
  isDirectory: z.boolean(),
  isFile: z.boolean(),
  isSymlink: z.boolean(),
});

export const DirentSchema = z
  .object({
    parentPath: AbsolutePathSchema,
    name: RelativePathSchema,
    direntFlags: DirentFlagsSchema,
  })
  .brand<"Dirent">();

export type Dirent = z.output<typeof DirentSchema>;
export type DirentFlags = z.output<typeof DirentFlagsSchema>;
