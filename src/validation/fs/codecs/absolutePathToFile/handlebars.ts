import z from "zod";

import { HandlebarsAbsolutePathSchema } from "../../../path/schemas/pathWithExtension.js";
import { FileSchema } from "../../schemas/file.js";

export const HandlebarsFileSchema = z
  .codec(HandlebarsAbsolutePathSchema, FileSchema, {
    decode: (value) => value,
    encode: (value) => HandlebarsAbsolutePathSchema.parse(value),
  })
  .brand<"HandlebarsFile">();
export type HandlebarsFile = z.output<typeof HandlebarsFileSchema>;
