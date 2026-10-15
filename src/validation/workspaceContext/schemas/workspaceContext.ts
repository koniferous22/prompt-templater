import type z from "zod";

import type { DirentFlagPatterns } from "../../../modules/direntFlagsMatcher/direntFlagsMatcher.js";
import { createFolderWithContentsSchema } from "../../fs/factories/folderWithContents.js";
import { PathFragmentSchema, type PathFragment } from "../../path/customTypes/path.js";

export const WorkspaceContextSchema = createFolderWithContentsSchema({
  pathDetection: "checkStaticEntries",
  items: new Map<PathFragment, DirentFlagPatterns>([
    [
      PathFragmentSchema.parse("templates"),
      {
        isDirectory: true,
        isFile: false,
        isSymlink: false,
      },
    ],
    [
      PathFragmentSchema.parse("terms"),
      {
        isDirectory: true,
        isFile: false,
        isSymlink: false,
      },
    ],
    [
      PathFragmentSchema.parse("workflows"),
      {
        isDirectory: true,
        isFile: false,
        isSymlink: false,
      },
    ],
  ]),
}).brand<"WorkspaceContext">();

export type WorkspaceContext = z.output<typeof WorkspaceContextSchema>;
