import type z from "zod";
import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppError } from "../neverthrow/errorFactory.js";
import type { MessageContext } from "../../../constants/errorMessages.js";

export const zodIssueFromAppError = <ErrorCode extends AppErrorCode>(error: AppError<ErrorCode>, options: { path: PropertyKey[] } = { path: [] }): z.core.$ZodIssueCustom => {
  return {
    code: 'custom',
    path: options.path, 
    message: error.message,
    params: {
      code: error.code,
      meta: error.meta,
    } satisfies {
      code: ErrorCode
      meta: MessageContext[ErrorCode],
    }
  };
}