import type { AbsolutePath } from "../validation/customTypes/path.js";
import type { AppErrorCode } from "./errorCodes.js";

export const errorMessages = {
  cliArgsProcessing_emptyStringAsArgument: () =>  'Expected CLI input arg to be non empty string',
  cliArgsProcessing_wrongArgumentFormat: () => 'Expected exactly 1 input CLI argument denoting workflow file',
  dependency_nodeFs_fsReadDirOperationFailed: (ctx: { rootFolder: AbsolutePath, errorMessage: string }) => `fs.listDir operation failed on root folder "${ctx.rootFolder}" with message "${ctx.errorMessage}"`,
  dependency_nodeFs_fsStatOperationFailed: (ctx: { value: string, errorMessage: string  }) => `fs.stat operation failed on entry "${ctx.value}" with message "${ctx.errorMessage}"`,
  dependency_nodeFs_fsStatInvalidShape: () => 'unexpected output of fs.stat from node:fs, expected "Stats" class',
  validation_types_absolutePath_invalidInputFormat: (ctx: { value: string }) => `Expected absolute path, got "${ctx.value}"`,
  validation_types_absolutePath_pathDoesNotExist: (ctx: { value: string }) => `Expected existing absolute path for input "${ctx.value}"`,
  validation_types_absolutePath_pathIsNotFolder: (ctx: { value: string }) => `Expected folder for input "${ctx.value}"`,
} as const satisfies Record<AppErrorCode, ((ctx: any) => string)>;

export type MessageContext = {
  [K in AppErrorCode]: Parameters<typeof errorMessages[K]>[0];
};
