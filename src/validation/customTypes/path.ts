import path from "node:path";
import { z } from "zod";
import { errorMessages } from "../../constants/errorMessages.js";

export const AbsolutePathSchema = z
  .string()
  .check((ctx) => {
    if (!path.isAbsolute(ctx.value)) {
      ctx.issues.push({
        code: 'custom',
        message: errorMessages.validation_types_absolutePath_invalidInputFormat({ value: ctx.value }),
        input: ctx.value,
        continue: false,
      })
    }
  })
  .brand<'AbsolutePath'>()

export type AbsolutePath = z.output<typeof AbsolutePathSchema>;
// TODO - try implementing automatic `neverthrow` mapping