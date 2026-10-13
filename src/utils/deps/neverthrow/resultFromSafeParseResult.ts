import { err, ok } from "neverthrow";
import { match, P } from "ts-pattern";
import { ZodError, type ZodSafeParseResult } from "zod";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { errorMessages } from "../../../constants/errorMessages.js";
import { appAggregateErr, appErr, createError } from "./errorFactory.js";
import type { AppError, AppErrors } from "./types.js";

export const errFromZodError = <T>(zodError: ZodError<T>) => {
  const errors = zodError.issues.map((issue): AppError<AppErrorCode> => {
    if (issue.code !== "custom") {
      return createError("dependency_zod_validationError", { zodError }, { cause: zodError });
    }
    const params = issue.params ?? {};
    const errorCode = params.code;
    if (errorCode in errorMessages) {
      return createError(errorCode as AppErrorCode, params.meta as any, {
        cause: zodError,
      });
    }
    return createError("dependency_zod_validationError", { zodError }, { cause: zodError });
  });
  const error = match(errors)
    .with([], () =>
      appErr("dependency_zod_safeParseErrorWithoutIssues", undefined, {
        cause: zodError,
      }),
    )
    .with([P.any], ([error]) => err(error))
    // @ts-expect-error workaround for limited type narrowing
    .otherwise((errors: AppErrors) => appAggregateErr(...errors));
  return error;
};

export const resultFromSafeParseResult = <T>(safeParseResult: ZodSafeParseResult<T>) => {
  return safeParseResult.success
    ? ok(safeParseResult.data)
    : errFromZodError(safeParseResult.error);
};
