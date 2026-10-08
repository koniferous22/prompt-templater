import path from "path/posix";
import z from "zod";
import { zodRegisterIssue } from "../../../../utils/zod/zodRegisterIssue.js";
import { errorMessages } from "../../../../constants/errorMessages.js";

export const AbsolutePathPosixSchema = z
  .string()
  .check((ctx) => {
    if (!path.posix.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_posix_absolutePath_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<'AbsolutePathPosix'>()

export type AbsolutePathPosix = z.output<typeof AbsolutePathPosixSchema>;

export const RelativePathPosixSchema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_posix_relativePath_emptyInput() })
  .check((ctx) => {
    if (path.posix.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_posix_relativePath_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<"RelativePathPosix">();
export type RelativePathPosix = z.output<typeof RelativePathPosixSchema>;

export const PathFragmentPosixSchema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_posix_pathFragment_emptyInput() })
  .check((ctx) => {
    if (path.posix.basename(ctx.value) !== ctx.value) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_posix_pathFragment_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<"PathFragmentPosix">();

export type PathFragmentPosix = z.output<typeof PathFragmentPosixSchema>;
