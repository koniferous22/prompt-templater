import path from "path/posix";
import z from "zod";
import { zodRegisterIssue } from "../../../../utils/zod/zodRegisterIssue.js";
import { errorMessages } from "../../../../constants/errorMessages.js";

const UnbrandedAbsolutePathPosixSchema = z
  .string()
  .check((ctx) => {
    if (!path.posix.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_posix_absolutePath_invalidInputFormat', { value: ctx.value });
    }
  });
export const AbsolutePathPosixSchema = UnbrandedAbsolutePathPosixSchema.brand<'AbsolutePathPosix'>()
export const AbsolutePathSchema = UnbrandedAbsolutePathPosixSchema.brand<'AbsolutePath'>()

export type AbsolutePathPosix = z.output<typeof AbsolutePathPosixSchema>;

const UnbrandedRelativePathPosixSchema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_posix_relativePath_emptyInput() })
  .check((ctx) => {
    if (path.posix.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_posix_relativePath_invalidInputFormat', { value: ctx.value });
    }
  });
export const RelativePathPosixSchema = UnbrandedRelativePathPosixSchema.brand<"RelativePathPosix">();
export const RelativePathSchema = UnbrandedRelativePathPosixSchema.brand<"RelativePath">();

export type RelativePathPosix = z.output<typeof RelativePathPosixSchema>;

const UnbrandedPathFragmentPosixSchema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_posix_pathFragment_emptyInput() })
  .check((ctx) => {
    if (path.posix.basename(ctx.value) !== ctx.value) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_posix_pathFragment_invalidInputFormat', { value: ctx.value });
    }
  });
export const PathFragmentPosixSchema = UnbrandedRelativePathPosixSchema.brand<"PathFragmentPosix">();
export const PathFragmentSchema = UnbrandedRelativePathPosixSchema.brand<"PathFragment">();

export type PathFragmentPosix = z.output<typeof PathFragmentPosixSchema>;
