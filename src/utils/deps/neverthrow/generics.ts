import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppAggregateErr, AppErrorInstance, AppErrors, OptionalAppErrors } from "./types.js";

type AppErrorFromOptionalAppErrorsAcc<
  ErrorCodes extends AppErrorCode = AppErrorCode,
  OptionalErrorTypes extends OptionalAppErrors<ErrorCodes> = OptionalAppErrors<ErrorCodes>,
  AggregatedErrors extends AppErrorInstance<ErrorCodes>[] = AppErrorInstance<ErrorCodes>[],
> = OptionalErrorTypes extends [infer FirstOptionalError, ...infer Rest]
  ? FirstOptionalError extends undefined
    ? Rest extends OptionalAppErrors<ErrorCodes>
      ? AppErrorFromOptionalAppErrorsAcc<ErrorCodes, Rest, AggregatedErrors>
      : // Should never happen - "Rest" should always extend original predicate
        never
    : FirstOptionalError extends AppErrorInstance<ErrorCodes>
      ? Rest extends OptionalAppErrors<ErrorCodes>
        ? AppErrorFromOptionalAppErrorsAcc<
            ErrorCodes,
            Rest,
            [...AggregatedErrors, FirstOptionalError]
          >
        : // Should never happen - "Rest" should always extend original predicate
          never
      : // Should never happen - "FirstOptionalError" is always extend the original predicate
        never
  : // Othewise all input errors have been processed
    AggregatedErrors extends AppErrors<ErrorCodes>
    ? // Aggregate error in case there are 2 or more
      AppAggregateErr<ErrorCodes, AggregatedErrors>
    : AggregatedErrors extends [AppErrorInstance<ErrorCodes>]
      ? // Plain error in case of 1
        AggregatedErrors[0]
      : // otherwise return null for empty tuples
        null;

export type AppErrorFromOptionalAppErrors<
  ErrorCodes extends AppErrorCode = AppErrorCode,
  OptionalErrorTypes extends OptionalAppErrors<ErrorCodes> = OptionalAppErrors<ErrorCodes>,
> = number extends OptionalErrorTypes["length"]
  ? // Generic response if input is not inferred as tuple
    AppErrorInstance<ErrorCodes> | AppAggregateErr<ErrorCodes> | null
  : AppErrorFromOptionalAppErrorsAcc<ErrorCodes, OptionalErrorTypes, []>;
