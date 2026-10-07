import fs from "node:fs";
import { z } from "zod";
import { AbsolutePathSchema, type AbsolutePath } from "../inputTypes/path.js";
import { errorMessages } from "../../constants/errorMessages.js";


export const FolderSchema = AbsolutePathSchema
  .check(async (ctx) => {
    if (!fs.existsSync(ctx.value)) {
      ctx.issues.push({
        code: 'custom',
        message: errorMessages.inputValidation_absolutePathDoesNotExist({ value: ctx.value }),
        input: ctx.value,
        continue: false,
      })
      return;
    }
    // TBD - implement here the `fs.lstat`
    // if (!fs.existsSync(ctx.value)) {
    //   ctx.issues.push({
    //     code: 'custom',
    //     message: messages.inputValidation_absolutePathDoesNotExist({ value: ctx.value }),
    //     input: ctx.value,
    //     continue: false,
    //   })
    //   return;
    // }
  })
  .brand<'Folder'>()

// TODO - try implementing automatic `neverthrow` mapping
