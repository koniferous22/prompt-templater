import type { z } from "zod";
import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppError } from "../neverthrow/errorFactory.js";
import type { MessageContext } from "../../../constants/errorMessages.js";

export const zodIssueFromAppError = <
  ErrorCode extends AppErrorCode,
  Input
>(error: AppError<ErrorCode>, input: Input, options: { path: PropertyKey[]; continue: boolean } = { path: [], continue: false })  => {
  return {
    code: 'custom',
    path: options.path, 
    message: error.message,
    input,
    continue: options.continue,
    params: {
      code: error.code,
      meta: error.meta,
    } satisfies {
      code: ErrorCode
      meta: MessageContext[ErrorCode],
    }
  } satisfies z.core.ParsePayload['issues'][number]
}