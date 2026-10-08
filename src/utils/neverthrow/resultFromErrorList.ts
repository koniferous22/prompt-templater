import { Result, err, ok } from "neverthrow";
import { match, P } from "ts-pattern";
import type { AppErrorCode } from "../../constants/errorCodes.js";
import { type AppError, type AppErrors, appAggregateErr } from "./errorFactory.js";

export const resultFromHomogeneousErrorList = <
  C extends AppErrorCode,
>(
  ...errors: AppError<C>[]
) => {
  const result = match<AppError<C>[], Result<undefined, AppError<C>> | Result<undefined, AppErrors>>(errors)
    .with([P._], ([error]) => err(error))
    .with(
      [P._, P._, ...P.array()],
      ([first, second, ...rest]) => appAggregateErr(
        // @ts-expect-error some too strict of inferrence
        first,
        second,
        ...rest
      ),
    )
    .with(
      // Expecting empty array here     
      P.array(),
      // @ts-expect-error
      () => {
        return ok(undefined);
      }
    )
    .exhaustive(); 
  return result;
};

