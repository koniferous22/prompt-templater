import z from "zod";

import { FileSchema } from "../../schemas/file.js";
import { PugAbsolutePathSchema } from "../../schemas/pathWithExtensions.js";

export const PugFileSchema = z
  .codec(PugAbsolutePathSchema, FileSchema, {
    decode: (value) => value,
    encode: (value) => PugAbsolutePathSchema.parse(value),
  })
  .brand<"PugFile">();
export type PugFile = z.output<typeof PugFileSchema>;
