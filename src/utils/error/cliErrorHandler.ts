import type { Result } from "neverthrow";

import type { AppErrorCode } from "../../constants/errorCodes.js";
import type { AppAggregateErr, AppError } from "../deps/neverthrow/types.js";

export const handleCliError =
  (cb: () => Promise<Result<any, AppError<AppErrorCode> | AppAggregateErr>>) => async () => {
    const result = await cb();
    if (result.isErr()) {
      const formattedError =
        result.error.type === "plain"
          ? result.error.message
          : result.error.errors.map(({ message }) => message).join("\n");
      console.error(formattedError);
      process.exitCode = 1;
    }
  };
