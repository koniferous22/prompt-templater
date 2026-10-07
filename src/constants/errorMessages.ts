import type { AppErrorCode } from "./errorCodes.js";

export const messages = {
  cliArgsProcessing_emptyStringAsArgument: () =>  'Expected CLI input arg to be non empty string',
  cliArgsProcessing_wrongArgumentFormat: () => 'Expected exactly 1 input CLI argument denoting workflow file',
  inputValidation_inputIsNotAbsolutePath: (ctx ?: { value: string }) => `Expected absolute path${ctx !== undefined ? `, got "${ctx.value}"` : ''}`
} as const satisfies Record<AppErrorCode, string | ((ctx?: any) => string)>;

export type MessageContext = {
  [K in AppErrorCode]?: Parameters<typeof messages[K]>[0];
};