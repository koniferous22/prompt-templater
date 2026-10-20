import fs from "node:fs";

import { z } from "zod";

import { DirentSchema } from "../schemas/dirent.js";

export const FsDirentSchema = z.instanceof(fs.Dirent);
export type FsDirent = z.output<typeof FsDirentSchema>;

const CodecOutputSchema = z.object({
  direntObject: FsDirentSchema,
  dirent: DirentSchema,
});

export const DirentObjectToDirentSchema = z.codec(FsDirentSchema, CodecOutputSchema, {
  decode: (direntObject) => {
    return {
      direntObject: direntObject,
      dirent: {
        parentPath: direntObject.parentPath,
        name: direntObject.name.toString("utf-8"),
        direntFlags: {
          isDirectory: direntObject.isDirectory(),
          isFile: direntObject.isFile(),
          isSymlink: direntObject.isSymbolicLink(),
        },
      },
    };
  },
  encode: ({ direntObject }) => FsDirentSchema.parse(direntObject),
});
