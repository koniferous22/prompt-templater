import z from "zod";

import { FsDirentSchema } from "../external/node/fs.js";
import { AbsolutePathSchema, RelativePathSchema } from "../customTypes/path.js";

const DirentFlagsSchema = z.object({
  isDirectory: z.boolean(),
  isFile: z.boolean(),
  isSymlink: z.boolean(),
})

export const DirentSchema = FsDirentSchema.transform(
  (dirent) => {
    return {
      parentPath: dirent.parentPath,
      name: dirent.name.toString("utf-8"),
      direntFlags: {
        isDirectory: dirent.isDirectory(),
        isFile: dirent.isFile(),
        isSymlink: dirent.isSymbolicLink(),
      },
    };
  }
).pipe(z.object({
  parentPath: AbsolutePathSchema,
  name: RelativePathSchema,
  direntFlags: DirentFlagsSchema,
}));

export type DirentFlagsData = z.output<typeof DirentFlagsSchema>

export type DirentData = z.output<typeof DirentSchema>;
