import { err, ok } from "neverthrow";
import type { ZodSafeParseResult } from "zod";
import type { AppError } from "../../constants/errorCodes.js";
import { appAggregateErr, appErr, createError } from "./errorFactory.js";
import { match, P } from "ts-pattern";
import { errorMessages } from "../../constants/errorMessages.js";

export const resultFromSafeParseResult = <T>(safeParseResult: ZodSafeParseResult<T>) => {
  if (safeParseResult.success) {
    return ok(safeParseResult.data);
  }
  const errors = safeParseResult.error.issues.map((issue): AppError => {
    if (issue.code !== 'custom') {
      return createError('dependency_zod_validationError', { zodError: safeParseResult.error }, { cause: safeParseResult.error });
    }
    const params = issue.params ?? {};
    const errorCode = params.code;
    if (errorCode in errorMessages) {
      return createError(
        errorCode as keyof typeof errorMessages,
        params.meta as any,
        {
          cause: safeParseResult.error,
        }
      );
    }
    return createError('dependency_zod_validationError', { zodError: safeParseResult.error }, { cause: safeParseResult.error });
  });
  const error = match(errors)
    .with([], () => appErr('dependency_zod_safeParseErrorWithoutIssues', undefined, {
      cause: safeParseResult.error,
    }))
    .with([P.any], ([error]) => err(error))
    .otherwise((errors) => appAggregateErr(...errors));
  return error;
};
