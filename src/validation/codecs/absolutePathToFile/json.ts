import z from "zod";

import { FileSchema } from "../../schemas/fs/file.js";
import { JsonAbsolutePathSchema } from "../../schemas/path/pathWithExtensions.js";

export const JsonFileSchema = z
  .codec(JsonAbsolutePathSchema, FileSchema, {
    decode: (value) => value,
    encode: (value) => JsonAbsolutePathSchema.parse(value),
  })
  .brand<"JsonFile">();
export type JsonFile = z.output<typeof JsonFileSchema>;
