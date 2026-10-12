import { NonEmptyStringSchema } from './string.js';
import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";

export const FileExtensionSchema = NonEmptyStringSchema
  .check((ctx) => {
    if (ctx.value.includes('.')) {
      zodRegisterIssue(
        ctx.value,
        ctx,
        'validation_customTypes_fileExtension_invalidInput',
        {
          value: ctx.value,
        }
      )
    }
  })
  .brand<"FileExtension">();
