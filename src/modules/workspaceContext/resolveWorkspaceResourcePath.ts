import { join } from "path";

import { ok, Result } from "neverthrow";

import { appErr } from "../../utils/deps/neverthrow/errorFactory.js";
import type { AppError } from "../../utils/deps/neverthrow/types.js";
import {
  AbsolutePathSchema,
  type AbsolutePath,
  type RelativePath,
} from "../../validation/path/customTypes/index.js";
import type {
  JsonRelativePath,
  JsonAbsolutePath,
  YamlAbsolutePath,
  YamlRelativePath,
  HandlebarsAbsolutePath,
  HandlebarsRelativePath,
} from "../../validation/path/schemas/pathWithExtension.js";
import type { WorkspaceContext } from "../../validation/workspaceContext/schemas/workspaceContext.js";

type ResolveWorkspaceResourceRelativePathError =
  AppError<"module_workspaceContext_resolveWorkspaceResourcePath_resolveWorkspaceResourceRelativePath_invalidRelativePath">;

export function resolveWorkspaceResourceRelativePath(
  workspaceContext: WorkspaceContext,
  inputPath: JsonRelativePath,
): Result<JsonAbsolutePath, ResolveWorkspaceResourceRelativePathError>;
export function resolveWorkspaceResourceRelativePath(
  workspaceContext: WorkspaceContext,
  inputPath: YamlRelativePath,
): Result<YamlAbsolutePath, ResolveWorkspaceResourceRelativePathError>;
export function resolveWorkspaceResourceRelativePath(
  workspaceContext: WorkspaceContext,
  inputPath: HandlebarsRelativePath,
): Result<HandlebarsAbsolutePath, ResolveWorkspaceResourceRelativePathError>;
export function resolveWorkspaceResourceRelativePath(
  workspaceContext: WorkspaceContext,
  inputPath: RelativePath,
): Result<HandlebarsAbsolutePath, ResolveWorkspaceResourceRelativePathError>;
export function resolveWorkspaceResourceRelativePath(
  workspaceContext: WorkspaceContext,
  inputPath: RelativePath,
): Result<AbsolutePath, ResolveWorkspaceResourceRelativePathError> {
  const absolutePathResult = AbsolutePathSchema.safeParse(join(workspaceContext, inputPath));
  return absolutePathResult.success
    ? ok(absolutePathResult.data)
    : appErr(
        "module_workspaceContext_resolveWorkspaceResourcePath_resolveWorkspaceResourceRelativePath_invalidRelativePath",
        {
          value: inputPath,
        },
      );
}

type ResolveWorkspaceResourceReferenceError =
  AppError<"module_workspaceContext_resolveWorkspaceResourcePath_resolveWorkspaceResourceReference_invalidRelativePath">;

export function resolveWorkspaceResourceReference(
  workspaceContext: WorkspaceContext,
  inputPath: JsonAbsolutePath | JsonRelativePath,
): Result<JsonAbsolutePath, ResolveWorkspaceResourceReferenceError>;
export function resolveWorkspaceResourceReference(
  workspaceContext: WorkspaceContext,
  inputPath: YamlAbsolutePath | YamlRelativePath,
): Result<YamlAbsolutePath, ResolveWorkspaceResourceReferenceError>;
export function resolveWorkspaceResourceReference(
  workspaceContext: WorkspaceContext,
  inputPath: HandlebarsAbsolutePath | HandlebarsRelativePath,
): Result<HandlebarsAbsolutePath, ResolveWorkspaceResourceReferenceError>;
export function resolveWorkspaceResourceReference(
  workspaceContext: WorkspaceContext,
  inputPath: AbsolutePath | RelativePath,
): Result<HandlebarsAbsolutePath, ResolveWorkspaceResourceReferenceError>;
export function resolveWorkspaceResourceReference(
  workspaceContext: WorkspaceContext,
  inputPath: AbsolutePath | RelativePath,
): Result<AbsolutePath, ResolveWorkspaceResourceReferenceError> {
  let absolutePathResult = AbsolutePathSchema.safeParse(inputPath);
  if (absolutePathResult.success) {
    return ok(absolutePathResult.data);
  }
  absolutePathResult = AbsolutePathSchema.safeParse(join(workspaceContext, inputPath));
  return absolutePathResult.success
    ? ok(absolutePathResult.data)
    : appErr(
        "module_workspaceContext_resolveWorkspaceResourcePath_resolveWorkspaceResourceReference_invalidRelativePath",
        {
          value: inputPath,
        },
      );
}
