import { err, ok } from "neverthrow";
import { ZodError, type ZodSafeParseResult } from "zod";
import type { AppError } from "../../constants/errorCodes.js";
import { appAggregateErr, appErr, createError } from "./errorFactory.js";
import { match, P } from "ts-pattern";
import { errorMessages } from "../../constants/errorMessages.js";

export const errFromZodError = <T>(zodError: ZodError<T>) => {

  const errors = zodError.issues.map((issue): AppError => {
    if (issue.code !== 'custom') {
      return createError('dependency_zod_validationError', { zodError }, { cause: zodError });
    }
    const params = issue.params ?? {};
    const errorCode = params.code;
    if (errorCode in errorMessages) {
      return createError(
        errorCode as keyof typeof errorMessages,
        params.meta as any,
        {
          cause: zodError,
        }
      );
    }
    return createError('dependency_zod_validationError', { zodError }, { cause: zodError });
  });
  const error = match(errors)
    .with([], () => appErr('dependency_zod_safeParseErrorWithoutIssues', undefined, {
      cause: zodError,
    }))
    .with([P.any], ([error]) => err(error))
    .otherwise((errors) => appAggregateErr(...errors));
  return error;
};

export const resultFromSafeParseResult = <T>(safeParseResult: ZodSafeParseResult<T>) => {
  return safeParseResult.success ?
    ok(safeParseResult.data) :
    errFromZodError(safeParseResult.error);
};
