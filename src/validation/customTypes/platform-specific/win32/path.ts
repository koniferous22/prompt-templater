import path from "path/win32";
import z from "zod";
import { zodRegisterIssue } from "../../../../utils/zod/zodRegisterIssue.js";
import { errorMessages } from "../../../../constants/errorMessages.js";

export const AbsolutePathWin32Schema = z
  .string()
  .check((ctx) => {
    if (!path.win32.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_win32_absolutePath_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<'AbsolutePathWin32'>()

export type AbsolutePathWin32 = z.output<typeof AbsolutePathWin32Schema>;

export const RelativePathWin32Schema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_win32_relativePath_emptyInput() })
  .check((ctx) => {
    if (path.win32.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_win32_relativePath_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<"RelativePathWin32">();
export type RelativePathWin32 = z.output<typeof RelativePathWin32Schema>;

export const PathFragmentWin32Schema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_win32_pathFragment_emptyInput() })
  .check((ctx) => {
    if (path.win32.basename(ctx.value) !== ctx.value) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_win32_pathFragment_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<"PathFragmentWin32">();

export type PathFragmentWin32 = z.output<typeof PathFragmentWin32Schema>;
