import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";
import { AbsolutePathToFsStatsSchema } from "../codecs/absolutePathToFsStats.js";

export const FolderSchema = AbsolutePathToFsStatsSchema.check((ctx) => {
  if (!ctx.value.fsStats.isDirectory()) {
    zodRegisterIssue(
      ctx.value.absolutePath,
      ctx,
      "validation_schemas_folderSchema_pathIsNotFolder",
      { value: ctx.value.absolutePath },
    );
  }
})
  .transform(({ absolutePath }) => absolutePath)
  .brand<"Folder">();
