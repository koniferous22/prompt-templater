import { Err, err } from "neverthrow";
import { match, P } from "ts-pattern";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { createAggregateError } from "./errorFactory.js";
import type { AppErrors, AppError, AppAggregateErr } from "./types.js";

export const errorFromErrorList = <
  ErrorCodes extends AppErrorCode = AppErrorCode,
  ErrorTypes extends AppErrors<ErrorCodes> = AppErrors<ErrorCodes>,
>(
  ...errors: [AppError<ErrorCodes>, ...AppError<ErrorCodes>[]]
) => {
  const result = match(errors)
    .returnType<AppError<ErrorCodes> | AppAggregateErr<ErrorCodes, ErrorTypes>>()
    .with(
      [P._, P._, ...P.array()],
      // @ts-expect-error some too strict of inferrence
      ([first, second, ...rest]) => createAggregateError(first, second, ...rest),
    )
    .otherwise(([error]) => error);
  return result;
};

export const resultFromErrorList = <C extends AppErrorCode>(
  ...errors: [Err<unknown, AppError<C>>, ...Err<unknown, AppError<C>>[]]
) => {
  const unwrappedErrors = errors.map((error) => error.error) as [AppError<C>, ...AppError<C>[]];
  return err(errorFromErrorList(...unwrappedErrors));
};
