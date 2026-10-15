import path from "path/win32";

import z from "zod";

import { errorMessages } from "../../../../../constants/errorMessages.js";
import { zodRegisterIssue } from "../../../../../utils/deps/zod/zodRegisterIssue.js";
import type {
  AbsolutePathLiteral,
  PathFragmentLiteral,
  RelativePathLiteral,
} from "../../typeBrands/path.js";

const UnbrandedAbsolutePathWin32Schema = z.string().check((ctx) => {
  if (!path.win32.isAbsolute(ctx.value)) {
    zodRegisterIssue(
      ctx.value,
      ctx,
      "validation_path_customTypes_win32_absolutePath_invalidInputFormat",
      { value: ctx.value },
    );
  }
});
export const AbsolutePathWin32Schema =
  UnbrandedAbsolutePathWin32Schema.brand<"AbsolutePathWin32">();
export const AbsolutePathSchema = UnbrandedAbsolutePathWin32Schema.brand<AbsolutePathLiteral>();

export type AbsolutePathWin32 = z.output<typeof AbsolutePathWin32Schema>;

const UnbrandedRelativePathWin32Schema = z
  .string()
  .min(1, { error: errorMessages.validation_path_customTypes_win32_relativePath_emptyInput() })
  .check((ctx) => {
    if (path.win32.isAbsolute(ctx.value)) {
      zodRegisterIssue(
        ctx.value,
        ctx,
        "validation_path_customTypes_win32_relativePath_invalidInputFormat",
        { value: ctx.value },
      );
    }
  });
export const RelativePathWin32Schema =
  UnbrandedRelativePathWin32Schema.brand<"RelativePathWin32">();
export const RelativePathSchema = UnbrandedRelativePathWin32Schema.brand<RelativePathLiteral>();

export type RelativePathWin32 = z.output<typeof RelativePathWin32Schema>;

const UnbrandedPathFragmentWin32Schema = z
  .string()
  .min(1, { error: errorMessages.validation_path_customTypes_win32_pathFragment_emptyInput() })
  .check((ctx) => {
    if (path.win32.basename(ctx.value) !== ctx.value) {
      zodRegisterIssue(
        ctx.value,
        ctx,
        "validation_path_customTypes_win32_pathFragment_invalidInputFormat",
        { value: ctx.value },
      );
    }
  });
export const PathFragmentWin32Schema =
  UnbrandedPathFragmentWin32Schema.brand<"PathFragmentWin32">().brand<"RelativePathWin32">();
export const PathFragmentSchema =
  UnbrandedPathFragmentWin32Schema.brand<PathFragmentLiteral>().brand<RelativePathLiteral>();

export type PathFragmentWin32 = z.output<typeof PathFragmentWin32Schema>;
