import fs from 'node:fs';
import z from "zod";
import { AbsolutePathSchema } from "../inputTypes/path.js";
import { FsStatsSchema } from "../schemas/fs.js";
import { messages } from '../../constants/errorMessages.js';

const CodecOutputSchema = z.object({
  absolutePath: AbsolutePathSchema,
  fsStats: FsStatsSchema,
});

export const AbsolutePathToStats = z.codec(
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
          message: messages.fs_statOperationFailed({ value: absolutePath, errorMessage: err.message }),
          input: absolutePath,
        });
        return z.NEVER;
      }
    },
    encode: async ({ absolutePath }) => AbsolutePathSchema.parse(absolutePath),
  }
);
