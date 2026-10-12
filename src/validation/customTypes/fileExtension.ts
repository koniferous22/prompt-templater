import type z from "zod";

import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";
import { NonEmptyStringSchema } from "./string.js";

export const FileExtensionSchema = NonEmptyStringSchema.check((ctx) => {
  if (ctx.value.includes(".")) {
    zodRegisterIssue(ctx.value, ctx, "validation_customTypes_fileExtension_invalidInput", {
      value: ctx.value,
    });
  }
}).brand<"FileExtension">();

export type FileExtension = z.output<typeof FileExtensionSchema>;
