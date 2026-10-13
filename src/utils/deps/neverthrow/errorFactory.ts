import { err, errAsync, Result, ResultAsync } from "neverthrow";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { errorMessages, type MessageContext } from "../../../constants/errorMessages.js";
import type { AppErrOpts, AppError, AppErrors, AppAggregateErr } from "./types.js";

export const createError = <const C extends AppErrorCode>(
  code: C,
  meta: MessageContext[C],
  opts?: AppErrOpts,
): AppError<C> => {
  // Temporarily commented out until I have error type that actually makes use of context
  // const message = opts?.message ?? messages[code](opts?.meta as any);
  const message =
    opts?.message ?? (errorMessages[code] as (ctx: MessageContext[C]) => string)(meta);
  return {
    type: "plain",
    code,
    message,
    cause: opts?.cause,
    meta,
  };
};
export const createAggregateError = <
  ErrorCodes extends AppErrorCode = AppErrorCode,
  ErrorTypes extends AppErrors<ErrorCodes> = AppErrors<ErrorCodes>,
>(
  ...errors: ErrorTypes
): AppAggregateErr<ErrorCodes, ErrorTypes> => {
  return {
    type: "aggregate",
    errors,
  };
};

// `neverthrow` wrappers
export const appErr = <C extends AppErrorCode>(
  code: C,
  meta: MessageContext[C],
  opts?: Parameters<typeof createError>[2],
) => err(createError(code, meta, opts));

export const appErrAsync = <C extends AppErrorCode>(
  code: C,
  meta: MessageContext[C],
  opts?: Parameters<typeof createError>[2],
) => errAsync(createError(code, meta, opts));

export const appAggregateErr = <
  ErrorCodes extends AppErrorCode = AppErrorCode,
  ErrorTypes extends AppErrors<ErrorCodes> = AppErrors<ErrorCodes>,
>(
  ...errors: ErrorTypes
): Result<never, AppAggregateErr<ErrorCodes, ErrorTypes>> => {
  // @ts-expect-error
  return err(createAggregateError(...errors));
};

export const appAggregateErrAsync = <
  ErrorCodes extends AppErrorCode = AppErrorCode,
  ErrorTypes extends AppErrors<ErrorCodes> = AppErrors<ErrorCodes>,
>(
  ...errors: ErrorTypes
): ResultAsync<never, AppAggregateErr<ErrorCodes, ErrorTypes>> => {
  return errAsync(createAggregateError(...errors));
};
