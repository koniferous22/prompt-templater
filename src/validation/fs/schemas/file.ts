import type z from "zod";

import { zodRegisterIssue } from "../../../utils/deps/zod/zodRegisterIssue.js";
import { AbsolutePathToFsStatsSchema } from "../codecs/absolutePathToFsStats.js";

export const FileSchema = AbsolutePathToFsStatsSchema.check((ctx) => {
  if (!ctx.value.fsStats.isFile()) {
    zodRegisterIssue(ctx.value.absolutePath, ctx, "validation_schemas_fileSchema_pathIsNotFolder", {
      value: ctx.value.absolutePath,
    });
  }
})
  .transform(({ absolutePath }) => absolutePath)
  .brand<"File">();

export type File = z.output<typeof FileSchema>;
