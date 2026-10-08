import path from "path/win32";
import z from "zod";
import { zodRegisterIssue } from "../../../../utils/zod/zodRegisterIssue.js";
import { errorMessages } from "../../../../constants/errorMessages.js";

export const PathFragmentWin32Schema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_pathFragmentWin32_emptyInput() })
  .check((ctx) => {
    if (path.win32.basename(ctx.value) !== ctx.value) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_pathFragmentWin32_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<"PathFragmentWin32">();

export type PathFragmentWin32 = z.output<typeof PathFragmentWin32Schema>;

