import path from "node:path";
import { z } from "zod";
import { zodRegisterIssue } from "../../utils/zod/zodRegisterIssue.js";

export const AbsolutePathSchema = z
  .string()
  .check((ctx) => {
    if (!path.isAbsolute(ctx.value)) {
      zodRegisterIssue(ctx.value, ctx, 'validation_types_absolutePath_invalidInputFormat', { value: ctx.value });
    }
  })
  .brand<'AbsolutePath'>()

export type AbsolutePath = z.output<typeof AbsolutePathSchema>;
