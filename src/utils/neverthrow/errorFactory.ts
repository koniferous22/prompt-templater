import { err, errAsync } from 'neverthrow';
import type { AppError, AppErrorCode } from '../../constants/errorCodes.js';
import { errorMessages, type MessageContext } from '../../constants/errorMessages.js';

export interface AppErrOpts<C extends AppErrorCode> {
  cause?: unknown;
  meta?: MessageContext[C];
  message?: string;
}

export function createError<C extends AppErrorCode>(
  code: C,
  opts?: AppErrOpts<C>,
): AppError {
  // Temporarily commented out until I have error type that actually makes use of context
  // const message = opts?.message ?? messages[code](opts?.meta as any);
  const message = opts?.message ?? (errorMessages[code] as (ctx: MessageContext[C]) => string)(opts?.meta ?? undefined);
  return {
    code,
    message,
    cause: opts?.cause,
    meta: opts?.meta as any,
  };
}

// `neverthrow` wrappers
export const appErr = <C extends AppErrorCode>(
  code: C,
  opts?: Parameters<typeof createError>[1]
) => err(createError(code, opts));

export const appErrAsync = <C extends AppErrorCode>(
  code: C,
  opts?: Parameters<typeof createError>[1]
) => errAsync(createError(code, opts));
