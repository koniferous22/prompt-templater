import fs from 'node:fs';
import z from "zod";
import { AbsolutePathSchema } from "../customTypes/path.js";
import { FsStatsSchema } from "../external/node/fs.js";
import { errorMessages } from '../../constants/errorMessages.js';

const CodecOutputSchema = z.object({
  absolutePath: AbsolutePathSchema,
  fsStats: FsStatsSchema,
});

export const AbsolutePathToFsStatsSchema = z.codec(
  AbsolutePathSchema,
  CodecOutputSchema,
  {
    decode: async (absolutePath, ctx) => {
      try {
        const fsStats = await fs.promises.stat(absolutePath);
        return {
          absolutePath,
          fsStats,
        };
      } catch (err: any) {
        ctx.issues.push({
          code: "custom",
          message: errorMessages.dependency_nodeFs_fsStatOperationFailed({ value: absolutePath, errorMessage: err.message }),
          input: absolutePath,
          continue: false,
        });
        return z.NEVER;
      }
    },
    encode: async ({ absolutePath }) => AbsolutePathSchema.parse(absolutePath),
  }
);
