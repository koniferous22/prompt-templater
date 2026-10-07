import path from "node:path";
import { z } from "zod";
import { messages } from "../constants/errorMessages.js";

export const AbsolutePathSchema = z
  .string()
  .check((ctx) => {
    if (!path.isAbsolute(ctx.value)) {
      ctx.issues.push({
        code: 'custom',
        message: messages.inputValidation_inputIsNotAbsolutePath({ value: ctx.value }),
        input: ctx.value,
      })
    }
  });

// TODO - try implementing automatic `neverthrow` mapping