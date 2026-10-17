import z from "zod";

import { FileExtensionSchema } from "../customTypes/fileExtension.js";
import {
  createAbsolutePathWithExtensionSchema,
  createRelativePathWithExtensionSchema,
} from "../factories/pathWithExtension.js";

// Absolute Paths

export const JsonAbsolutePathSchema = createAbsolutePathWithExtensionSchema(
  FileExtensionSchema.parse("json"),
).brand<"JsonAbsolutePath">();
export type JsonAbsolutePath = z.output<typeof JsonAbsolutePathSchema>;
export const YamlAbsolutePathSchema = createAbsolutePathWithExtensionSchema(
  FileExtensionSchema.parse("yaml"),
  FileExtensionSchema.parse("yml"),
).brand<"YamlAbsolutePath">();
export type YamlAbsolutePath = z.output<typeof YamlAbsolutePathSchema>;
export const HandlebarsAbsolutePathSchema = createAbsolutePathWithExtensionSchema(
  FileExtensionSchema.parse("hbs"),
).brand<"HandlebarsAbsolutePath">();
export type HandlebarsAbsolutePath = z.output<typeof HandlebarsAbsolutePathSchema>;

// Relative Paths

export const JsonRelativePathSchema = createRelativePathWithExtensionSchema(
  FileExtensionSchema.parse("json"),
).brand<"JsonRelativePath">();
export type JsonRelativePath = z.output<typeof JsonRelativePathSchema>;
export const YamlRelativePathSchema = createRelativePathWithExtensionSchema(
  FileExtensionSchema.parse("yaml"),
  FileExtensionSchema.parse("yml"),
).brand<"YamlRelativePath">();
export type YamlRelativePath = z.output<typeof YamlRelativePathSchema>;
export const HandlebarsRelativePathSchema = createRelativePathWithExtensionSchema(
  FileExtensionSchema.parse("hbs"),
).brand<"HandlebarsRelativePath">();
export type HandlebarsRelativePath = z.output<typeof HandlebarsRelativePathSchema>;

// z.union

export const JsonFilepathSchema = z.union([JsonAbsolutePathSchema, JsonRelativePathSchema]);
export type JsonFilepath = z.output<typeof JsonFilepathSchema>;

export const YamlFilepathSchema = z.union([YamlAbsolutePathSchema, YamlRelativePathSchema]);
export type YamlFilepath = z.output<typeof YamlFilepathSchema>;

export const HandlebarsFilepathSchema = z.union([
  HandlebarsAbsolutePathSchema,
  HandlebarsRelativePathSchema,
]);
export type HandlebarsFilepath = z.output<typeof HandlebarsFilepathSchema>;
