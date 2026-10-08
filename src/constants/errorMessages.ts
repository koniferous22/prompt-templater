import { z, type ZodError } from "zod";
import type { AbsolutePath } from "../validation/customTypes/path.js";
import type { AppErrorCode } from "./errorCodes.js";

export const errorMessages = {
  cliArgsProcessing_emptyStringAsArgument: () =>  'Expected CLI input arg to be non empty string',
  cliArgsProcessing_wrongArgumentFormat: () => 'Expected exactly 1 input CLI argument denoting workflow file',
  dependency_nodeFs_fsReadDirOperationFailed: (ctx: { rootFolder: AbsolutePath, errorMessage: string }) => `fs.listDir operation failed on root folder "${ctx.rootFolder}" with message "${ctx.errorMessage}"`,
  dependency_nodeFs_fsStatOperationFailed: (ctx: { value: string, errorMessage: string  }) => `fs.stat operation failed on entry "${ctx.value}" with message "${ctx.errorMessage}"`,
  dependency_nodeFs_fsStatInvalidShape: () => 'unexpected output of fs.stat from node:fs, expected "Stats" class',
  dependency_zod_safeParseErrorWithoutIssues: () => `Encountered "zod" error with no attached issues`,
  dependency_zod_validationError: (ctx: { zodError: ZodError<any>}) => `Encountered "zod" validation error\n${z.prettifyError(ctx.zodError)}`,
  validation_customTypes_absolutePath_invalidInputFormat: (ctx: { value: string }) => `Expected absolute path, got "${ctx.value}"`,
  validation_customTypes_pathFragmentPosix_emptyInput: () => 'Expected POSIX path fragment, got ""',
  validation_customTypes_pathFragmentPosix_invalidInputFormat: (ctx: { value: string }) => `Expected POSIX path fragment (no '/' characters), got "${ctx.value}"`,
  validation_customTypes_pathFragmentWin32_emptyInput: () => 'Expected Win32 path fragment, got ""',
  validation_customTypes_pathFragmentWin32_invalidInputFormat: (ctx: { value: string }) => `Expected Win32 path fragment (no '/' or '\\' characters), got "${ctx.value}"`,
  validation_customTypes_relativePath_emptyInput: () => 'Expected relative path, got ""',
  validation_customTypes_relativePath_invalidInputFormat: (ctx: { value: string }) => `Expected relative path, got "${ctx.value}"`,
  validation_schemas_folderSchema_pathDoesNotExist: (ctx: { value: string }) => `Expected existing absolute path for input "${ctx.value}"`,
  validation_schemas_folderSchema_pathIsNotFolder: (ctx: { value: string }) => `Expected folder for input "${ctx.value}"`,
} as const satisfies Record<AppErrorCode, ((ctx: any) => string)>;

export type MessageContext = {
  [K in AppErrorCode]: Parameters<typeof errorMessages[K]>[0];
};
