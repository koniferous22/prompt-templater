import { Err, err } from "neverthrow";
import { match, P } from "ts-pattern";
import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { type AppError, type AppErrors, appAggregateErr } from "./errorFactory.js";

export const resultFromErrorList = <
  C extends AppErrorCode,
>(
  ...errors: [AppError<C>, ...AppError<C>[]]
) => {
  const result = match(errors)
    .returnType<Err<unknown, AppError<C>> | Err<unknown, AppErrors<C>>>()
    .with(
      [P._, P._, ...P.array()],
        // @ts-expect-error some too strict of inferrence
        ([first, second, ...rest]) => appAggregateErr(
        // @ts-expect-error some too strict of inferrence
        first,
        second,
        ...rest
      ),
    )
    .otherwise(([error]) => err(error));
  return result;
};

export const resultFromErrors = <
  C extends AppErrorCode,
>(
  ...errors: [Err<unknown, AppError<C>>, ...Err<unknown, AppError<C>>[]]
) => {
  const unwrappedErrors = errors.map((error) => error.error) as [AppError<C>, ...AppError<C>[]];
  return resultFromErrorList(...unwrappedErrors);
};
