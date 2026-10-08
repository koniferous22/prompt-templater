import path from "node:path";
import { z } from "zod";
import { zodRegisterIssue } from "../../utils/zod/zodRegisterIssue.js";
import { errorMessages } from "../../constants/errorMessages.js";

export const AbsolutePathSchema = z
  .string()
  .check((ctx) => {
    if (!path.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_absolutePath_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<'AbsolutePath'>()

export type AbsolutePath = z.output<typeof AbsolutePathSchema>;

export const RelativePathSchema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_relativePath_emptyInput() })
  .check((ctx) => {
    if (path.posix.isAbsolute(ctx.value) || path.win32.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_relativePath_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<"RelativePath">();
export type RelativePath = z.output<typeof RelativePathSchema>;
