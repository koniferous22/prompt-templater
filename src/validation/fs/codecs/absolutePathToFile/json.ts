import z from "zod";

import { JsonAbsolutePathSchema } from "../../../path/schemas/pathWithExtension.js";
import { FileSchema } from "../../schemas/file.js";

export const JsonFileSchema = z
  .codec(JsonAbsolutePathSchema, FileSchema, {
    decode: (value) => value,
    encode: (value) => JsonAbsolutePathSchema.parse(value),
  })
  .brand<"JsonFile">();
export type JsonFile = z.output<typeof JsonFileSchema>;
