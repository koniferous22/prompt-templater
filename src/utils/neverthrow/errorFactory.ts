import { err, errAsync } from 'neverthrow';
import type { AppError, AppErrorCode } from '../../constants/errorCodes.js';
import { errorMessages, type MessageContext } from '../../constants/errorMessages.js';

export interface AppErrOpts {
  cause?: unknown;
  message?: string;
}

export function createError<C extends AppErrorCode>(
  code: C,
  meta: MessageContext[C],
  opts?: AppErrOpts,
): AppError {
  // Temporarily commented out until I have error type that actually makes use of context
  // const message = opts?.message ?? messages[code](opts?.meta as any);
  const message = opts?.message ?? (errorMessages[code] as (ctx: MessageContext[C]) => string)(meta);
  return {
    code,
    message,
    cause: opts?.cause,
    meta: meta ?? {},
  };
}

// `neverthrow` wrappers
export const appErr = <C extends AppErrorCode>(
  code: C,
  meta: MessageContext[C],
  opts?: Parameters<typeof createError>[2]
) => err(createError(code, meta, opts));

export const appErrAsync = <C extends AppErrorCode>(
  code: C,
  meta: MessageContext[C],
  opts?: Parameters<typeof createError>[2]
) => errAsync(createError(code, meta, opts));

export const appAggregateErr = (
  ...args: AppError[]
) => err(args);

export const appAggregateErrAsync = (
  ...args: AppError[]
) => errAsync(args);
