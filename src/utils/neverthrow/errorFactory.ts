import { err, errAsync } from 'neverthrow';
import type { AppError, AppErrorCode } from '../../constants/errorCodes.js';
import { messages, type MessageContext } from '../../constants/errorMessages.js';

export function createError<C extends AppErrorCode>(
  code: C,
  opts?: {
    cause?: unknown;
    meta?: MessageContext[C];
    message?: string;
  }
): AppError {
  // Temporarily commented out until I have error type that actually makes use of context
  // const message = opts?.message ?? messages[code](opts?.meta as any);
  const message = (function () {
    if (opts?.message !== undefined) {
      return opts.message;
    }
    // Temporarily commented out until I have error type that actually makes use of context
    // return typeof messages[code] === 'function' ? messages[code](opts?.meta) : messages[code];
    return messages[code];
  })()
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
