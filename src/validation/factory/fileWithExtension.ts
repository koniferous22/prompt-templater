import path from "node:path";

import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";
import type { FileExtension } from "../customTypes/fileExtension.js";
import { FileSchema } from "../schemas/file.js";

export const createFileWithExtensionSchema = (extension: FileExtension) => {
  return FileSchema.check(async (ctx) => {
    const extname = path.extname(ctx.value);
    const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;
    if (fileExtension !== extension) {
      zodRegisterIssue(ctx.value, ctx, "validation_factories_fileWithExtension_invalidExtension", {
        expectedExtension: extension,
        file: ctx.value,
      });
    }
  }).brand<"FileWithExtension">();
};
