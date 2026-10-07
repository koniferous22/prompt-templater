import { errorMessages } from "../../constants/errorMessages.js";
import { AbsolutePathToStats } from "../codecs/absolutePathFsStats.js";

export const FolderSchema = AbsolutePathToStats
  .check((ctx) => {
    if (!ctx.value.fsStats.isDirectory()) {
      ctx.issues.push({
        code: 'custom',
        message: errorMessages.inputValidation_absolutePathDoesNotExist({ value: ctx.value.absolutePath }),
        input: ctx.value.absolutePath,
        continue: false,
      })
    }
  })
  .brand<'Folder'>();
// TODO - try implementing automatic `neverthrow` mapping
