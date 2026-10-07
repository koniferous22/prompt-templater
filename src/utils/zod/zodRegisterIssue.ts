import type { core } from "zod";
import type { AppErrorCode } from "../../constants/errorCodes.js";
import { errorMessages, type MessageContext } from "../../constants/errorMessages.js";

export const zodRegisterIssue = <
  Input extends unknown,
  ErrorCode extends AppErrorCode,
>(
  input: unknown,
  ctx: core.ParsePayload<Input>,
  code: ErrorCode,
  meta: MessageContext[ErrorCode],
) => {
  ctx.issues.push({
    code: "custom",
    message: (errorMessages[code] as (ctx: MessageContext[ErrorCode]) => string)(meta),
    input,
    continue: false,
    params: {
      code,
      meta,
    } satisfies {
      code: ErrorCode
      meta: MessageContext[ErrorCode],
    }
  })
};
