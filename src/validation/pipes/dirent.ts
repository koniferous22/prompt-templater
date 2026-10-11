import z from "zod";

import { FsDirentSchema } from "../external/node/fs.js";

export const DirentSchema = FsDirentSchema.pipe(
  z.transform((dirent) => {
    return {
      parentPath: dirent.parentPath,
      name: dirent.name.toString("utf-8"),
      direntFlags: {
        isDirectory: dirent.isDirectory(),
        isFile: dirent.isFile(),
        isSymlink: dirent.isSymbolicLink(),
      },
    };
  }),
);

export type DirentData = z.output<typeof DirentSchema>;
