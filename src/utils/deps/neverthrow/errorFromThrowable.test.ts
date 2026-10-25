import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { createError } from "./errorFactory.js";
import { appErrAsyncFromThrowable } from "./errorFromThrowable.js";
import type { AppError } from "./types.js";

const testCasesForErrorFromOptionalErrorList = [
  {
    testInput: {
      data: {
        throwable: async () => {
          const error = new Error("test error");
          throw error;
        },
        errorHandler: (err) => {
          if (err instanceof Error) {
            if (err.message === "test error") {
              return createError("dependency_nodeFs_fsReadDir_invalidOuptutShape", undefined);
            }
            return createError("dependency_zod_safeParseErrorWithoutIssues", undefined);
          }
          return createError("module_deferredInputContext_rejectedValue", undefined);
        },
      },
      testCaseDescription: "throwable that throws error",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "dependency_nodeFs_fsReadDir_invalidOuptutShape",
      },
      testBehaviourDescription: "return error with correct error code",
    },
  },
  {
    testInput: {
      data: {
        throwable: async () => {
          return 1;
        },
        errorHandler: (err) => {
          if (err instanceof Error) {
            if (err.message === "test error") {
              return createError("dependency_nodeFs_fsReadDir_invalidOuptutShape", undefined);
            }
            return createError("dependency_zod_safeParseErrorWithoutIssues", undefined);
          }
          return createError("module_deferredInputContext_rejectedValue", undefined);
        },
      },
      testCaseDescription: "throwable that throws error",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "return ok",
    },
  },
] satisfies {
  testInput: {
    data: {
      throwable: () => Promise<any>;
      errorHandler: (err: unknown) => AppError<AppErrorCode>;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("appErrAsyncFromThrowable", () => {
  for (const { testInput, testOutcome } of testCasesForErrorFromOptionalErrorList) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resultFn = appErrAsyncFromThrowable(
        testInput.data.throwable,
        testInput.data.errorHandler,
      );
      const result = await resultFn();
      assert.strictEqual(result.isOk(), testOutcome.data.result);
      if (testOutcome.data.result === false) {
        assert.strictEqual(result.isErr() && result.error.code, testOutcome.data.errorCode);
      }
    });
  }
});
