import type { AppErrorCode } from "./errorCodes.js";

export const errorMessages = {
  cliArgsProcessing_emptyStringAsArgument: () =>  'Expected CLI input arg to be non empty string',
  cliArgsProcessing_wrongArgumentFormat: () => 'Expected exactly 1 input CLI argument denoting workflow file',
  dependency_nodeFs_fsStatOperationFailed: (ctx?: { value: string, errorMessage: string  }) => `fs.stat operation failed${ctx !== undefined ? `on entry "${ctx.value}" with message "${ctx.errorMessage}"` : ''}`,
  dependency_nodeFs_fsStatInvalidShape: () => 'unexpected output of fs.stat from node:fs, expected "Stats" class',
  inputValidation_inputIsNotAbsolutePath: (ctx ?: { value: string }) => `Expected absolute path${ctx !== undefined ? `, got "${ctx.value}"` : ''}`,
  inputValidation_absolutePathDoesNotExist: (ctx ?: { value: string }) => `Expected existing absolute path ${ctx !== undefined ? ` for input "${ctx.value}"` : ''}`,
  inputValidation_absolutePathIsNotFolder: (ctx ?: { value: string }) => `Expected folder${ctx !== undefined ? ` for input "${ctx.value}"` : ''}`,
} as const satisfies Record<AppErrorCode, string | ((ctx?: any) => string)>;

export type MessageContext = {
  [K in AppErrorCode]: Parameters<typeof errorMessages[K]>[0];
};