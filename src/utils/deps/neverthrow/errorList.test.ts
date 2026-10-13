import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { err, type Err } from "neverthrow";
import { match } from "ts-pattern";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { createError } from "./errorFactory.js";
import { errorFromErrorList, resultFromErrorList } from "./errorList.js";
import type { AppError } from "./types.js";

const errorStandalone1 = createError(
  "module_direntFlagsMatcher_createDirentFlagsMapFailed",
  undefined,
);
const errorStandalone2 = createError("dependency_zod_safeParseErrorWithoutIssues", undefined);

const testCasesForErrorFromErrorList = [
  {
    testInput: {
      data: [errorStandalone1] as [AppError<AppErrorCode>, ...AppError<AppErrorCode>[]],
      testCaseDescription: "input consisting of single error",
    },
    testOutcome: {
      data: {
        type: "plain",
        error: errorStandalone1,
      },
      testBehaviourDescription: "return single app error",
    },
  },
  {
    testInput: {
      data: [errorStandalone1, errorStandalone1] as [
        AppError<AppErrorCode>,
        ...AppError<AppErrorCode>[],
      ],
      testCaseDescription: "input consisting of multiple errors of same type",
    },
    testOutcome: {
      data: {
        type: "aggregate",
        errors: [errorStandalone1, errorStandalone1],
      },
      testBehaviourDescription: "return aggregated error of multiple app errors of same type",
    },
  },
  {
    testInput: {
      data: [errorStandalone1, errorStandalone2] as [
        AppError<AppErrorCode>,
        ...AppError<AppErrorCode>[],
      ],
      testCaseDescription: "input consisting of multiple errors of varying types",
    },
    testOutcome: {
      data: {
        type: "aggregate",
        errors: [errorStandalone1, errorStandalone2],
      },
      testBehaviourDescription: "return aggregated error of multiple app errors of varying types",
    },
  },
] satisfies {
  testInput: {
    data: [AppError<AppErrorCode>, ...AppError<AppErrorCode>[]];
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          type: "plain";
          error: AppError<AppErrorCode>;
        }
      | {
          type: "aggregate";
          errors: AppError<AppErrorCode>[];
        };
    testBehaviourDescription: string;
  };
}[];

describe("errorFromErrorList", () => {
  for (const { testInput, testOutcome } of testCasesForErrorFromErrorList) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = errorFromErrorList(...testInput.data);
      match(testOutcome.data)
        .with({ type: "plain" }, () => {
          assert.strictEqual(result.type, "plain");
          assert.deepStrictEqual(result, testOutcome.data.error);
        })
        .with({ type: "aggregate" }, () => {
          assert.strictEqual(result.type, "aggregate");
          assert.deepStrictEqual(result.errors, testOutcome.data.errors);
        })
        .exhaustive();
    });
  }
});

const testCasesForResultFromErrorList = [
  {
    testInput: {
      data: [err(errorStandalone1)] as [
        Err<unknown, AppError<AppErrorCode>>,
        ...Err<unknown, AppError<AppErrorCode>>[],
      ],
      testCaseDescription: "input consisting of single error",
    },
    testOutcome: {
      data: {
        type: "plain",
        error: errorStandalone1,
      },
      testBehaviourDescription: "return 'err' with single app error",
    },
  },
  {
    testInput: {
      data: [err(errorStandalone1), err(errorStandalone1)] as [
        Err<unknown, AppError<AppErrorCode>>,
        ...Err<unknown, AppError<AppErrorCode>>[],
      ],
      testCaseDescription: "input consisting of multiple errors of same type",
    },
    testOutcome: {
      data: {
        type: "aggregate",
        errors: [errorStandalone1, errorStandalone1],
      },
      testBehaviourDescription:
        "return 'err' with aggregated error of multiple app errors of same type",
    },
  },
  {
    testInput: {
      data: [err(errorStandalone1), err(errorStandalone2)] as [
        Err<unknown, AppError<AppErrorCode>>,
        ...Err<unknown, AppError<AppErrorCode>>[],
      ],
      testCaseDescription: "input consisting of multiple errors of varying types",
    },
    testOutcome: {
      data: {
        type: "aggregate",
        errors: [errorStandalone1, errorStandalone2],
      },
      testBehaviourDescription:
        "return 'err' with aggregated error of multiple app errors of varying types",
    },
  },
] satisfies {
  testInput: {
    data: [Err<unknown, AppError<AppErrorCode>>, ...Err<unknown, AppError<AppErrorCode>>[]];
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          type: "plain";
          error: AppError<AppErrorCode>;
        }
      | {
          type: "aggregate";
          errors: AppError<AppErrorCode>[];
        };
    testBehaviourDescription: string;
  };
}[];

describe("resultFromErrorList", () => {
  for (const { testInput, testOutcome } of testCasesForResultFromErrorList) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = resultFromErrorList(...testInput.data);
      assert.strictEqual(result.isOk(), false);
      match(testOutcome.data)
        .with({ type: "plain" }, () => {
          assert.strictEqual(result.error.type, "plain");
          assert.deepStrictEqual(result.error, testOutcome.data.error);
        })
        .with({ type: "aggregate" }, () => {
          assert.strictEqual(result.error.type, "aggregate");
          assert.deepStrictEqual(result.error.errors, testOutcome.data.errors);
        })
        .exhaustive();
    });
  }
});
