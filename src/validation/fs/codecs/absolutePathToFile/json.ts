import z from "zod";

import { FileSchema } from "../../schemas/file.js";
import { JsonAbsolutePathSchema } from "../../schemas/pathWithExtensions.js";

export const JsonFileSchema = z
  .codec(JsonAbsolutePathSchema, FileSchema, {
    decode: (value) => value,
    encode: (value) => JsonAbsolutePathSchema.parse(value),
  })
  .brand<"JsonFile">();
export type JsonFile = z.output<typeof JsonFileSchema>;
