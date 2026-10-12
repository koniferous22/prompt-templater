import path from "node:path";

import type { NonEmptyArray } from "../../utils/array/isNonEmptyArray.js";
import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";
import type { FileExtension } from "../customTypes/fileExtension.js";
import { FileSchema } from "../schemas/file.js";

export const createFileWithExtensionSchema = (...extensions: NonEmptyArray<FileExtension>) => {
  return FileSchema.check(async (ctx) => {
    const extname = path.extname(ctx.value);
    const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;
    if (extensions.includes(fileExtension as any)) {
      zodRegisterIssue(ctx.value, ctx, "validation_factories_fileWithExtension_invalidExtension", {
        expectedExtensions: extensions,
        file: ctx.value,
      });
    }
  }).brand<"FileWithExtension">();
};
