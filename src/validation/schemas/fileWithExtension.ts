import type z from "zod";

import { FileExtensionSchema } from "../customTypes/fileExtension.js";
import { createFileWithExtensionSchema } from "../factory/fileWithExtension.js";

export const JsonFileSchema = createFileWithExtensionSchema(
  FileExtensionSchema.parse("json"),
).brand<"JsonFile">();
export type JsonFile = z.output<typeof JsonFileSchema>;
export const YamlFileSchema = createFileWithExtensionSchema(
  FileExtensionSchema.parse("yaml"),
).brand<"YamlFile">();
export type YamlFile = z.output<typeof YamlFileSchema>;
export const PugFileSchema = createFileWithExtensionSchema(
  FileExtensionSchema.parse("pug"),
).brand<"PugFile">();
export type PugFile = z.output<typeof PugFileSchema>;
