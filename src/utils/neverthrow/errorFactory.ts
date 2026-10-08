import { err, errAsync, Result, ResultAsync } from 'neverthrow';
import type { AppErrorCode } from '../../constants/errorCodes.js';
import { errorMessages, type MessageContext } from '../../constants/errorMessages.js';

export type AppError<C extends AppErrorCode> = {
  readonly code: AppErrorCode;
  readonly message: string;
  readonly cause?: unknown;
  readonly meta: MessageContext[C];
};

export type AppErrorInstance = {
  [C in AppErrorCode]: AppError<C>;
}[AppErrorCode];

export type AppErrors = readonly [AppErrorInstance, AppErrorInstance, ...AppErrorInstance[]];

export interface AppErrOpts {
  cause?: unknown;
  message?: string;
}

export function createError<C extends AppErrorCode>(
  code: C,
  meta: MessageContext[C],
  opts?: AppErrOpts,
): AppError<C> {
  // Temporarily commented out until I have error type that actually makes use of context
  // const message = opts?.message ?? messages[code](opts?.meta as any);
  const message = opts?.message ?? (errorMessages[code] as (ctx: MessageContext[C]) => string)(meta);
  return {
    code,
    message,
    cause: opts?.cause,
    meta,
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

export const appAggregateErr = <
  const ErrorTypes extends AppErrors,
>(...errors: ErrorTypes): Result<never, ErrorTypes> => {
  return err(errors);
}

export const appAggregateErrAsync = <
  const ErrorTypes extends AppErrors,
>(...errors: ErrorTypes): ResultAsync<never, ErrorTypes> => {
  return errAsync(errors);
}
