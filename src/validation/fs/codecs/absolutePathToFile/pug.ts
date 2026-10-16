import z from "zod";

import { PugAbsolutePathSchema } from "../../../path/schemas/pathWithExtension.js";
import { FileSchema } from "../../schemas/file.js";

export const PugFileSchema = z
  .codec(PugAbsolutePathSchema, FileSchema, {
    decode: (value) => value,
    encode: (value) => PugAbsolutePathSchema.parse(value),
  })
  .brand<"PugFile">();
export type PugFile = z.output<typeof PugFileSchema>;
