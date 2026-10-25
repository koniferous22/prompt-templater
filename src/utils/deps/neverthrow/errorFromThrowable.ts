import { ResultAsync } from "neverthrow";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppError } from "./types.js";

// Typescript wrapper for more strict inferrence on passed error function
export const appErrAsyncFromThrowable = <
  Args extends readonly any[],
  ReturnType extends any,
  ErrorCode extends AppErrorCode = AppErrorCode,
>(
  fn: (...args: Args) => Promise<ReturnType>,
  errorFn?: (err: unknown, ...args: Args) => AppError<ErrorCode>,
): ((...args: Args) => ResultAsync<ReturnType, AppError<ErrorCode>>) => {
  return (...args: Args) => {
    const wrappedErrorFunction = errorFn && ((err: unknown) => errorFn(err, ...args));
    const cb = ResultAsync.fromThrowable(fn, wrappedErrorFunction);
    const result = cb(...args);
    return result;
  };
};
