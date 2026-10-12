import { z, type ZodError } from "zod";

import type { NonEmptyArray } from "../utils/array/isNonEmptyArray.js";
import type { AbsolutePath, RelativePath } from "../validation/customTypes/path.js";
import type { DirentFlagsData } from "../validation/pipes/dirent.js";
import type { AppErrorCode } from "./errorCodes.js";

const createRenderItemList =
  <T>(renderItem: (item: T) => string) =>
  (items: [T, ...T[]], truncatedLength: number | null = 2): string => {
    const shouldTruncate = truncatedLength !== null && items.length > truncatedLength;
    const displayedItems = shouldTruncate
      ? [...items.slice(0, 2).map(renderItem), "..."]
      : items.map(renderItem);
    return displayedItems.join(", ");
  };

const renderStringList = createRenderItemList<string>((x: string) => x);

// TODO - often encountering circular references, because zod issue formatting reuses `errorMessages` as well

export const errorMessages = {
  dependency_nodeFs_fsReadDirInvalidOuptutShape: () =>
    'unexpected output of fs.readdir from node:fs, expected array of "Dirent" class',
  dependency_nodeFs_fsReadDirOperationFailed: (ctx: { rootFolder: string; errorMessage: string }) =>
    `fs.listDir operation failed on root folder "${ctx.rootFolder}" with message "${ctx.errorMessage}"`,
  dependency_nodeFs_fsStatInvalidOutputShape: () =>
    'unexpected output of fs.stat from node:fs, expected "Stats" class',
  dependency_nodeFs_fsStatOperationFailed: (ctx: { value: string; errorMessage: string }) =>
    `fs.stat operation failed on entry "${ctx.value}" with message "${ctx.errorMessage}"`,
  dependency_zod_awaitingAsyncDecode: (ctx: { errorMessage?: string }) =>
    `Encountered error when awaiting asynchronous zod parsing - ${ctx.errorMessage}`,
  dependency_zod_safeParseErrorWithoutIssues: () =>
    `Encountered "zod" error with no attached issues`,
  dependency_zod_validationError: (ctx: { zodError: ZodError<any> }) =>
    `Encountered "zod" validation error\n${z.prettifyError(ctx.zodError)}`,
  entrypoint_cli_positionalArgumentNotFile: (ctx: {
    path: AbsolutePath;
    type: "workflow" | "workflow preset";
  }) => `Received non-existing path "${ctx.path}" for ${ctx.type} input`,
  entrypoint_cli_unableToDetectContext: (ctx: { workflowFileInput: string }) =>
    `Unable to detect workspace context from workflow file "${ctx.workflowFileInput}"`,
  module_detectWorkspaceContext_noContextFound: (ctx: {
    workflowFile: AbsolutePath;
    workflowPresetFile?: AbsolutePath | undefined;
  }) =>
    `Unable to detect context from input workflow file "${ctx.workflowFile}"${ctx.workflowPresetFile !== undefined ? ` and workflow preset file "${ctx.workflowPresetFile}"` : ""}`,
  module_direntFlagsMatcher_createDirentFlagsMapFailed: () =>
    "Error creating data structure for validating FS shape",
  module_direntFlagsMatcher_extraItemsFound: (ctx: {
    expectedFolderPath: AbsolutePath;
    extraItem: AbsolutePath;
  }) => `Encountered unmatched entry "${ctx.extraItem}", located in "${ctx.expectedFolderPath}"`,
  module_direntFlagsMatcher_extraItemsFromWrongFolderFound: (ctx: {
    expectedFolderPath: AbsolutePath;
    extraItems: [string, ...string[]];
  }) =>
    `Encountered unmatched entries from expected folder path "${ctx.expectedFolderPath}" - ${renderStringList(ctx.extraItems)}`,
  module_direntFlagsMatcher_patternNotFound: (ctx: {
    pattern: RelativePath;
    parentPath: AbsolutePath;
  }) => `Expected "${ctx.pattern}" to be located in folder "${ctx.parentPath}"`,
  module_direntFlagsMatcher_unmatchedDirentFlag: (ctx: {
    direntFlag: keyof DirentFlagsData;
    expected: boolean;
    actual: boolean;
    path: AbsolutePath;
  }) =>
    `Encountered incorrect dirent flag "${ctx.direntFlag}" for "${ctx.path}"; expected - "${ctx.expected}", actual - "${ctx.actual}"`,
  validation_customTypes_nonEmptyString_invalidInput: (ctx: { value: string }) =>
    `Expected non-empty string got "${ctx.value}"`,
  validation_customTypes_fileExtension_invalidInput: (ctx: { value: string }) =>
    `Expected file extension got "${ctx.value}"`,
  validation_codec_nonEmptyStringToAbsoluteOrRelativePath_invalidInputData: (ctx: {
    value: string;
  }) => `Expected absolute or relative path, got "${ctx.value}`,
  validation_codec_absolutePathToFsStats_invalidInputData: (ctx: { zodError: ZodError<any> }) =>
    `Encountered "zod" validation error\n${z.prettifyError(ctx.zodError)}`,
  validation_customTypes_posix_absolutePath_invalidInputFormat: (ctx: { value: string }) =>
    `Expected POSIX absolute path, got "${ctx.value}"`,
  validation_customTypes_posix_pathFragment_emptyInput: () =>
    'Expected POSIX path fragment, got ""',
  validation_customTypes_posix_pathFragment_invalidInputFormat: (ctx: { value: string }) =>
    `Expected POSIX path fragment (no '/' characters), got "${ctx.value}"`,
  validation_customTypes_posix_relativePath_emptyInput: () =>
    'Expected POSIX relative path, got ""',
  validation_customTypes_posix_relativePath_invalidInputFormat: (ctx: { value: string }) =>
    `Expected POSIX relative path, got "${ctx.value}"`,
  validation_customTypes_win32_absolutePath_invalidInputFormat: (ctx: { value: string }) =>
    `Expected Win32 absolute path (no '/' or '\\' characters), got "${ctx.value}"`,
  validation_customTypes_win32_pathFragment_emptyInput: () =>
    'Expected Win32 path fragment, got ""',
  validation_customTypes_win32_pathFragment_invalidInputFormat: (ctx: { value: string }) =>
    `Expected Win32 path fragment (no '/' or '\\' characters), got "${ctx.value}"`,
  validation_customTypes_win32_relativePath_emptyInput: () =>
    'Expected Win32 relative path, got ""',
  validation_customTypes_win32_relativePath_invalidInputFormat: (ctx: { value: string }) =>
    `Expected Win32 relative path, got "${ctx.value}"`,
  validation_factories_absolutePathWithExtension_invalidExtension: (ctx: {
    expectedExtensions: NonEmptyArray<string>;
    file: AbsolutePath;
  }) =>
    `Expected ${ctx.expectedExtensions.length === 1 ? `extension "${ctx.expectedExtensions[0]}"` : `one of following extensions: ${renderStringList(ctx.expectedExtensions, null)}`} for file "${ctx.file}"`,
  validation_factories_relativePathWithExtension_invalidExtension: (ctx: {
    expectedExtensions: NonEmptyArray<string>;
    file: RelativePath;
  }) =>
    `Expected ${ctx.expectedExtensions.length === 1 ? `extension "${ctx.expectedExtensions[0]}"` : `one of following extensions: ${renderStringList(ctx.expectedExtensions, null)}`} for file "${ctx.file}"`,
  validation_schemas_fileSchema_pathIsNotFolder: (ctx: { value: string }) =>
    `Expected file for input "${ctx.value}"`,
  validation_schemas_folderSchema_pathIsNotFolder: (ctx: { value: string }) =>
    `Expected folder for input "${ctx.value}"`,
} as const satisfies Record<AppErrorCode, (ctx: any) => string>;

export type MessageContext = {
  [K in AppErrorCode]: Parameters<(typeof errorMessages)[K]>[0];
};
