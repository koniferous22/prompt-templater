import { Result, err } from "neverthrow";
import { match, P } from "ts-pattern";
import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { type AppError, type AppErrors, appAggregateErr } from "./errorFactory.js";

export const resultFromErrorList = <
  C extends AppErrorCode,
>(
  ...errors: [AppError<C>, ...AppError<C>[]]
) => {
  const result = match<[AppError<C>, ...AppError<C>[]], Result<undefined, AppError<C>> | Result<undefined, AppErrors<C>>>(errors)
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
