import { Result, ResultAsync } from "neverthrow";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppError } from "./types.js";

// Typescript wrapper for more strict inferrence on passed error function
export const appErrAsyncFromThrowable = <
  Args extends readonly any[],
  FnReturnType extends any,
  ErrorCode extends AppErrorCode = AppErrorCode,
>(
  fn: (...args: Args) => Promise<FnReturnType>,
  errorFn?: (err: unknown, ...args: Args) => AppError<ErrorCode>,
): ((...args: Args) => ResultAsync<FnReturnType, AppError<ErrorCode>>) => {
  return (...args: Args) => {
    const wrappedErrorFunction = errorFn && ((err: unknown) => errorFn(err, ...args));
    const cb = ResultAsync.fromThrowable(fn, wrappedErrorFunction);
    const result = cb(...args);
    return result;
  };
};

export const appErrFromThrowable = <
  Args extends readonly any[],
  FnReturnType extends any,
  ErrorCode extends AppErrorCode = AppErrorCode,
>(
  fn: (...args: Args) => FnReturnType,
  errorFn?: (err: unknown, ...args: Args) => AppError<ErrorCode>,
): ((...args: Args) => Result<FnReturnType, AppError<ErrorCode>>) => {
  return (...args: Args) => {
    const wrappedErrorFunction = errorFn && ((err: unknown) => errorFn(err, ...args));
    const cb = Result.fromThrowable(fn, wrappedErrorFunction);
    // @ts-expect-error
    const result = cb(...args);
    return result;
  };
};
