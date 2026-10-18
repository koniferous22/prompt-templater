import fs from "node:fs";

import z from "zod";

import { errorMessages } from "../../../constants/errorMessages.js";
import { zodRegisterIssue } from "../../../utils/deps/zod/zodRegisterIssue.js";
import { AbsolutePathSchema } from "../../path/customTypes/index.js";

// Note - Following doesn't work because of `private` constructor
// export const FsStatsSchema = z.instanceof(fs.Stats);
const FsStatsSchema = z.custom<fs.Stats>((val): val is fs.Stats => val instanceof fs.Stats, {
  error: errorMessages.dependency_nodeFs_fsStatInvalidOutputShape(),
});

const CodecOutputSchema = z.object({
  absolutePath: AbsolutePathSchema,
  fsStats: FsStatsSchema,
});

export const AbsolutePathToFsStatsSchema = z.codec(AbsolutePathSchema, CodecOutputSchema, {
  decode: async (absolutePath, ctx) => {
    try {
      const fsStats = await fs.promises.stat(absolutePath);
      return {
        absolutePath,
        fsStats,
      };
    } catch (err: any) {
      zodRegisterIssue(absolutePath, ctx, "dependency_nodeFs_fsStatOperationFailed", {
        value: absolutePath,
        errorMessage: err.message,
      });
      return z.NEVER;
    }
  },
  encode: async ({ absolutePath }) => AbsolutePathSchema.parse(absolutePath),
});
