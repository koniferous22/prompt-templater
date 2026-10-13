import { Err, err, ok } from "neverthrow";
import { match, P } from "ts-pattern";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { createAggregateError } from "./errorFactory.js";
import type { AppErrorFromOptionalAppErrors } from "./generics.js";
import type { AppError, AppErrorInstance, OptionalAppErrors } from "./types.js";

export const errorFromOptionalErrorList = <
  ErrorCodes extends AppErrorCode = AppErrorCode,
  OptionalErrorTypes extends OptionalAppErrors<ErrorCodes> = OptionalAppErrors<ErrorCodes>,
>(
  ...optionalErrors: OptionalErrorTypes
): AppErrorFromOptionalAppErrors<ErrorCodes, OptionalErrorTypes> => {
  const errors: AppErrorInstance<ErrorCodes>[] = optionalErrors.filter(
    (error) => error !== undefined,
  );
  const result = match(errors)
    .returnType<AppErrorFromOptionalAppErrors<ErrorCodes, OptionalErrorTypes>>()
    .with(
      [P._, P._, ...P.array()],
      // @ts-expect-error some too strict of inferrence
      ([first, second, ...rest]: [
        AppErrorInstance<ErrorCodes>,
        AppErrorInstance<ErrorCodes>,
        ...AppErrorInstance<ErrorCodes>[],
      ]) => createAggregateError(first, second, ...rest),
    )
    // @ts-expect-error some too strict of inferrence
    .with([P._], ([first]: [AppErrorInstance<ErrorCodes>]) => first)
    // @ts-expect-error some too strict of inferrence
    .otherwise(() => null);
  // @ts-expect-error some too strict of inferrence
  return result;
};

export const resultFromOptionalErrorList = <
  ErrorCodes extends AppErrorCode = AppErrorCode,
  OptionalErrorTypes extends [
    Err<never, AppError<AppErrorCode>> | undefined,
    ...(Err<never, AppError<AppErrorCode>> | undefined)[],
  ] = [
    Err<never, AppError<AppErrorCode>> | undefined,
    ...(Err<never, AppError<AppErrorCode>> | undefined)[],
  ],
>(
  ...optionalErrors: OptionalErrorTypes
) => {
  const unwrappedErrors = optionalErrors.map(
    (error) => error?.error,
  ) as OptionalAppErrors<ErrorCodes>;
  const result = errorFromOptionalErrorList<ErrorCodes>(...unwrappedErrors);
  return result === null ? ok(null) : err(result);
};
