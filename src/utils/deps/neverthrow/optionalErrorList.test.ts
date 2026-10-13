import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { err, type Err } from "neverthrow";
import { match } from "ts-pattern";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { createError } from "./errorFactory.js";
import { errorFromOptionalErrorList, resultFromOptionalErrorList } from "./optionalErrorList.js";
import type { AppError, OptionalAppErrors } from "./types.js";

const errorStandalone1 = createError(
  "module_direntFlagsMatcher_createDirentFlagsMapFailed",
  undefined,
);
const errorStandalone2 = createError("dependency_zod_safeParseErrorWithoutIssues", undefined);

const testCasesForErrorFromOptionalErrorList = [
  {
    testInput: {
      data: [undefined, undefined] as OptionalAppErrors<AppErrorCode>,
      testCaseDescription: "input consisting of no error",
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "return null",
    },
  },
  {
    testInput: {
      data: [errorStandalone1, undefined] as OptionalAppErrors<AppErrorCode>,
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
      data: [
        errorStandalone1,
        undefined,
        errorStandalone1,
        undefined,
      ] as OptionalAppErrors<AppErrorCode>,
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
      data: [
        errorStandalone1,
        undefined,
        errorStandalone2,
        undefined,
      ] as OptionalAppErrors<AppErrorCode>,
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
    data: OptionalAppErrors<AppErrorCode>;
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
        }
      | null;
    testBehaviourDescription: string;
  };
}[];

describe("errorFromOptionalErrorList", () => {
  for (const { testInput, testOutcome } of testCasesForErrorFromOptionalErrorList) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = errorFromOptionalErrorList(...testInput.data);
      match(testOutcome.data)
        .with(null, () => {
          assert.strictEqual(result, null);
        })
        .with({ type: "plain" }, () => {
          assert.strictEqual(result && result.type, "plain");
          assert.deepStrictEqual(result, testOutcome.data && testOutcome.data.error);
        })
        .with({ type: "aggregate" }, () => {
          assert.strictEqual(result && result.type, "aggregate");
          assert.deepStrictEqual(
            result && result.type === "aggregate" && result.errors,
            testOutcome.data && testOutcome.data.errors,
          );
        })
        .exhaustive();
    });
  }
});

const testCasesForResultFromOptionalErrorList = [
  {
    testInput: {
      data: [undefined, undefined] as [
        Err<never, AppError<AppErrorCode>> | undefined,
        ...(Err<never, AppError<AppErrorCode>> | undefined)[],
      ],
      testCaseDescription: "input consisting of no error",
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "return null",
    },
  },
  {
    testInput: {
      data: [err(errorStandalone1), undefined] as [
        Err<never, AppError<AppErrorCode>> | undefined,
        ...(Err<never, AppError<AppErrorCode>> | undefined)[],
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
      data: [err(errorStandalone1), undefined, err(errorStandalone1), undefined] as [
        Err<never, AppError<AppErrorCode>> | undefined,
        ...(Err<never, AppError<AppErrorCode>> | undefined)[],
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
      data: [err(errorStandalone1), undefined, err(errorStandalone2), undefined] as [
        Err<never, AppError<AppErrorCode>> | undefined,
        ...(Err<never, AppError<AppErrorCode>> | undefined)[],
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
    data: [
      Err<never, AppError<AppErrorCode>> | undefined,
      ...(Err<never, AppError<AppErrorCode>> | undefined)[],
    ];
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
        }
      | null;
    testBehaviourDescription: string;
  };
}[];

describe("resultFromOptionalErrorList", () => {
  for (const { testInput, testOutcome } of testCasesForResultFromOptionalErrorList) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = resultFromOptionalErrorList(...testInput.data);
      match(testOutcome.data)
        .with(null, () => {
          assert.strictEqual(result.isOk(), true);
          assert.strictEqual(result.isOk() && result.value, null);
        })
        .with({ type: "plain" }, () => {
          assert.strictEqual(result.isOk(), false);
          assert.strictEqual(result.isErr() && result.error.type, "plain");
          assert.deepStrictEqual(
            result.isErr() && result.error.type === "plain" && result.error,
            testOutcome.data && testOutcome.data.error,
          );
        })
        .with({ type: "aggregate" }, () => {
          assert.strictEqual(result.isOk(), false);
          assert.strictEqual(result.isErr() && result.error.type, "aggregate");
          assert.deepStrictEqual(
            result.isErr() && result.error.type === "aggregate" && result.error.errors,
            testOutcome.data && testOutcome.data.errors,
          );
        })
        .exhaustive();
    });
  }
});
