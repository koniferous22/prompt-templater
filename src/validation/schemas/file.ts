import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";
import { AbsolutePathToFsStatsSchema } from "../codecs/absolutePathFsStats.js";

export const FileSchema = AbsolutePathToFsStatsSchema
  .check((ctx) => {
    if (!ctx.value.fsStats.isFile()) {
      zodRegisterIssue(ctx.value.absolutePath, ctx, 'validation_schemas_folderSchema_pathIsNotFolder', { value: ctx.value.absolutePath });
    }
  })
  .transform(({ absolutePath }) => absolutePath)
  .brand<'File'>();
