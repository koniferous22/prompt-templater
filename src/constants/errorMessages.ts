import { z, type ZodError } from "zod";
import type { AppErrorCode } from "./errorCodes.js";
import type { DirentSchema } from "../validation/pipes/dirent.js";
import type { AbsolutePath, RelativePath } from "../validation/customTypes/path.js";

const createRenderItemList = <T>(renderItem: (item: T) => string) => (items: [T, ...T[]]): string => {
  const truncatedItems = items.length > 2 ? [ ...items.slice(0, 2).map(renderItem), '...' ] : items.map(renderItem);
  return truncatedItems.join(', ');
}

const renderStringList = createRenderItemList<string>((x: string) => x);

export const errorMessages = {
  cliArgsProcessing_emptyStringAsArgument: () =>  'Expected CLI input arg to be non empty string',
  cliArgsProcessing_wrongArgumentFormat: () => 'Expected exactly 1 input CLI argument denoting workflow file',
  dependency_nodeFs_fsReadDirInvalidOuptutShape: () => 'unexpected output of fs.readdir from node:fs, expected array of "Dirent" class',
  dependency_nodeFs_fsReadDirOperationFailed: (ctx: { rootFolder: string, errorMessage: string }) => `fs.listDir operation failed on root folder "${ctx.rootFolder}" with message "${ctx.errorMessage}"`,
  dependency_nodeFs_fsStatInvalidOutputShape: () => 'unexpected output of fs.stat from node:fs, expected "Stats" class',
  dependency_nodeFs_fsStatOperationFailed: (ctx: { value: string, errorMessage: string  }) => `fs.stat operation failed on entry "${ctx.value}" with message "${ctx.errorMessage}"`,
  dependency_zod_awaitingAsyncDecode: (ctx: { errorMessage?: string }) => `Encountered error when awaiting asynchronous zod parsing - ${ctx.errorMessage}`,
  dependency_zod_safeParseErrorWithoutIssues: () => `Encountered "zod" error with no attached issues`,
  dependency_zod_validationError: (ctx: { zodError: ZodError<any>}) => `Encountered "zod" validation error\n${z.prettifyError(ctx.zodError)}`,
  module_direntFlagsMatcher_createDirentFlagsMapFailed: () => 'Error creating data structure for validating FS shape',
  module_direntFlagsMatcher_extraItemsFound: (ctx: { expectedFolderPath: AbsolutePath; extraItem: AbsolutePath }) => `Encountered unmatched entry "${ctx.extraItem}", located in "${ctx.expectedFolderPath}"`,
  module_direntFlagsMatcher_extraItemsFromWrongFolderFound: (ctx: { expectedFolderPath: AbsolutePath; extraItems: [string, ...string[]] }) => `Encountered unmatched entries from expected folder path "${ctx.expectedFolderPath}" - ${renderStringList(ctx.extraItems)}`,
  module_direntFlagsMatcher_patternNotFound: (ctx: { pattern: RelativePath; parentPath: AbsolutePath }) => `Expected "${ctx.pattern}" to be located in folder "${ctx.parentPath}"`,
  module_direntFlagsMatcher_unmatchedDirentFlag: (ctx: { direntFlag: keyof z.output<typeof DirentSchema>['direntFlags']; expected: boolean; actual: boolean; path: AbsolutePath; }) => `Encountered incorrect dirent flag "${ctx.direntFlag}" for "${ctx.path}"; expected - "${ctx.expected}", actual - "${ctx.actual}"`,
  validation_codec_absolutePathToFsStats_invalidInputData: (ctx: { zodError: ZodError<any>}) => `Encountered "zod" validation error\n${z.prettifyError(ctx.zodError)}`,
  validation_customTypes_posix_absolutePath_invalidInputFormat: (ctx: { value: string }) => `Expected POSIX absolute path, got "${ctx.value}"`,
  validation_customTypes_posix_pathFragment_emptyInput: () => 'Expected POSIX path fragment, got ""',
  validation_customTypes_posix_pathFragment_invalidInputFormat: (ctx: { value: string }) => `Expected POSIX path fragment (no '/' characters), got "${ctx.value}"`,
  validation_customTypes_posix_relativePath_emptyInput: () => 'Expected POSIX relative path, got ""',
  validation_customTypes_posix_relativePath_invalidInputFormat: (ctx: { value: string }) => `Expected POSIX relative path, got "${ctx.value}"`,
  validation_customTypes_win32_absolutePath_invalidInputFormat: (ctx: { value: string }) => `Expected Win32 absolute path (no '/' or '\\' characters), got "${ctx.value}"`,
  validation_customTypes_win32_pathFragment_emptyInput: () => 'Expected Win32 path fragment, got ""',
  validation_customTypes_win32_pathFragment_invalidInputFormat: (ctx: { value: string }) => `Expected Win32 path fragment (no '/' or '\\' characters), got "${ctx.value}"`,
  validation_customTypes_win32_relativePath_emptyInput: () => 'Expected Win32 relative path, got ""',
  validation_customTypes_win32_relativePath_invalidInputFormat: (ctx: { value: string }) => `Expected Win32 relative path, got "${ctx.value}"`,
  validation_schemas_folderSchema_pathDoesNotExist: (ctx: { value: string }) => `Expected existing absolute path for input "${ctx.value}"`,
  validation_schemas_folderSchema_pathIsNotFolder: (ctx: { value: string }) => `Expected folder for input "${ctx.value}"`,
} as const satisfies Record<AppErrorCode, ((ctx: any) => string)>;

export type MessageContext = {
  [K in AppErrorCode]: Parameters<typeof errorMessages[K]>[0];
};
