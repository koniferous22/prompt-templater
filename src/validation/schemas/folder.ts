import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";
import { AbsolutePathToFsStatsSchema } from "../codecs/absolutePathFsStats.js";

export const FolderSchema = AbsolutePathToFsStatsSchema
  .check((ctx) => {
    if (!ctx.value.fsStats.isDirectory()) {
      zodRegisterIssue(ctx.value.absolutePath, ctx, 'validation_schemas_folderSchema_pathDoesNotExist', { value: ctx.value.absolutePath });
    }
  })
  .brand<'Folder'>();
// TODO - try implementing automatic `neverthrow` mapping
