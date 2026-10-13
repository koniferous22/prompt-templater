import z from "zod";

import { FileSchema } from "../../schemas/fs/file.js";
import { YamlAbsolutePathSchema } from "../../schemas/path/pathWithExtensions.js";

export const YamlFileSchema = z
  .codec(YamlAbsolutePathSchema, FileSchema, {
    decode: (value) => value,
    encode: (value) => YamlAbsolutePathSchema.parse(value),
  })
  .brand<"YamlFile">();
export type YamlFile = z.output<typeof YamlFileSchema>;
