import path from "path/posix";
import z from "zod";
import { zodRegisterIssue } from "../../../../utils/zod/zodRegisterIssue.js";
import { errorMessages } from "../../../../constants/errorMessages.js";

export const PathFragmentPosixSchema = z
  .string()
  .min(1, { error: errorMessages.validation_customTypes_pathFragmentPosix_emptyInput() })
  .check((ctx) => {
    if (path.posix.basename(ctx.value) !== ctx.value) {
      zodRegisterIssue(ctx.value, ctx, 'validation_customTypes_pathFragmentPosix_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<"PathFragmentPosix">();

export type PathFragmentPosix = z.output<typeof PathFragmentPosixSchema>;
