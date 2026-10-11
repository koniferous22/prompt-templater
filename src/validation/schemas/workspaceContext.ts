import { AbsolutePathSchema, PathFragmentSchema, RelativePathSchema, type PathFragment } from "../customTypes/path.js";
import { createFolderWithContentsSchema } from "../factory/folderWithContents.js";
import type { DirentFlagPatterns } from "../../modules/direntFlagsMatcher/direntFlagsMatcher.js";
import z from "zod";

export const WorkspaceContextSchema = createFolderWithContentsSchema(
  {
    pathDetection: 'checkStaticEntries',
    items: new Map<PathFragment, DirentFlagPatterns>([
      [
        PathFragmentSchema.parse('templates'),
        {
          isDirectory: true,
          isFile: false,
          isSymlink: false,
        }
      ],
      [
        PathFragmentSchema.parse('terms'),
        {
          isDirectory: true,
          isFile: false,
          isSymlink: false,
        }
      ],
      [
        PathFragmentSchema.parse('workflows'),
        {
          isDirectory: true,
          isFile: false,
          isSymlink: false,
        }
      ],
    ]),
  },
)

export const WorkspaceContextPathSchema = z.union([
  AbsolutePathSchema,
  RelativePathSchema,
]);
