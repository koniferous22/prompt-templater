import { errorMessages } from "../../constants/errorMessages.js";
import { AbsolutePathToFsStatsSchema } from "../codecs/absolutePathFsStats.js";

export const FolderSchema = AbsolutePathToFsStatsSchema
  .check((ctx) => {
    if (!ctx.value.fsStats.isDirectory()) {
      ctx.issues.push({
        code: 'custom',
        message: errorMessages.validation_types_absolutePath_pathDoesNotExist({ value: ctx.value.absolutePath }),
        input: ctx.value.absolutePath,
        continue: false,
      })
    }
  })
  .brand<'Folder'>();
// TODO - try implementing automatic `neverthrow` mapping
