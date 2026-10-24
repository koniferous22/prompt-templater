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
  errorFn?: (err: unknown) => AppError<ErrorCode>,
): ((...args: Args) => ResultAsync<ReturnType, AppError<ErrorCode>>) => {
  const result = ResultAsync.fromThrowable(fn, errorFn);
  return result;
};
