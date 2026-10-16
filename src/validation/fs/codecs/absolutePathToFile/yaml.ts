import z from "zod";

import { YamlAbsolutePathSchema } from "../../../path/schemas/pathWithExtension.js";
import { FileSchema } from "../../schemas/file.js";

export const YamlFileSchema = z
  .codec(YamlAbsolutePathSchema, FileSchema, {
    decode: (value) => value,
    encode: (value) => YamlAbsolutePathSchema.parse(value),
  })
  .brand<"YamlFile">();
export type YamlFile = z.output<typeof YamlFileSchema>;
