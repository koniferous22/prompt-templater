import path from "node:path";

import type z from "zod";

import { zodRegisterIssue } from "../../../utils/deps/zod/zodRegisterIssue.js";
import type { NonEmptyArray } from "../../array/factories/nonEmptyArray.js";
import type { FileExtension } from "../customTypes/fileExtension.js";
import { AbsolutePathSchema, RelativePathSchema } from "../customTypes/index.js";

export const createAbsolutePathWithExtensionSchema = (
  ...extensions: NonEmptyArray<FileExtension>
) => {
  return AbsolutePathSchema.check((ctx) => {
    const extname = path.extname(ctx.value);
    const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;

    if (!extensions.includes(fileExtension as any)) {
      zodRegisterIssue(
        ctx.value,
        ctx,
        "validation_path_factories_absolutePathWithExtension_invalidExtension",
        {
          expectedExtensions: extensions,
          file: ctx.value,
        },
      );
    }
  }).brand<"AbsolutePathWithExtension">();
};
export type AbsolutePathWithExtension = z.output<
  ReturnType<typeof createAbsolutePathWithExtensionSchema>
>;

export const createRelativePathWithExtensionSchema = (
  ...extensions: NonEmptyArray<FileExtension>
) => {
  return RelativePathSchema.check((ctx) => {
    const extname = path.extname(ctx.value);
    const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;

    if (!extensions.includes(fileExtension as any)) {
      zodRegisterIssue(
        ctx.value,
        ctx,
        "validation_path_factories_relativePathWithExtension_invalidExtension",
        {
          expectedExtensions: extensions,
          file: ctx.value,
        },
      );
    }
  }).brand<"RelativePathWithExtension">();
};
export type RelativePathWithExtension = z.output<
  ReturnType<typeof createRelativePathWithExtensionSchema>
>;
