import type { AppErrorCode } from "./errorCodes.js";

export const messages = {
  cliArgsProcessing_emptyStringAsArgument:  'Expected CLI input arg to be non empty string',
  cliArgsProcessing_wrongArgumentFormat: 'Expected exactly 1 input CLI argument denoting workflow file',
} as const satisfies Record<AppErrorCode, string | ((ctx?: any) => string)>;

export type MessageContext = {
  [K in AppErrorCode]?: typeof messages[K] extends (...args: any[]) => any ? Parameters<typeof messages[K]>[0] : undefined;
};