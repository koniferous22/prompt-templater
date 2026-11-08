import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";

import { expectTypeOf } from "expect-type";
import { err, type Err } from "neverthrow";
import { match } from "ts-pattern";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { createError } from "./errorFactory.js";
import { errorFromOptionalErrorList, resultFromOptionalErrorList } from "./optionalErrorList.js";
import type { AppAggregateErr, AppError, OptionalAppErrors } from "./types.js";

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
          expect(result).toBe(null);
        })
        .with({ type: "plain" }, (plainError) => {
          expect(result).toStrictEqual(plainError.error);
        })
        .with({ type: "aggregate" }, (aggregateError) => {
          assert.ok(testOutcome.data);
          assert.strictEqual(testOutcome.data.type, "aggregate");
          expect(testOutcome.data && testOutcome.data.errors).toStrictEqual(aggregateError.errors);
        })
        .exhaustive();
      match(result)
        .with(null, (nullResult) => {
          expectTypeOf(nullResult).toEqualTypeOf<null>();
        })
        .with({ type: "plain" }, (plainErrorResult) => {
          expectTypeOf(plainErrorResult).toExtend<AppError<AppErrorCode>>();
        })
        .with({ type: "aggregate" }, (aggregateErrorResult) => {
          expectTypeOf(aggregateErrorResult).toExtend<AppAggregateErr>();
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
          assert.ok(result.isOk());
          expect(result.value).toBe(null);
        })
        .with({ type: "plain" }, (plainError) => {
          assert.ok(result.isErr());
          assert.strictEqual(result.error.type, "plain");
          expect(result.error).toStrictEqual(plainError.error);
        })
        .with({ type: "aggregate" }, (aggregateError) => {
          assert.ok(result.isErr());
          assert.strictEqual(result.error.type, "aggregate");
          expect(result.error.errors).toStrictEqual(
            // @ts-expect-error
            aggregateError.errors,
          );
        })
        .exhaustive();
      result.isOk()
        ? expectTypeOf(result.value).toEqualTypeOf<null>()
        : match(result.error)
            .with({ type: "plain" }, (plainErrorResult) =>
              expectTypeOf(plainErrorResult).toExtend<AppError<AppErrorCode>>(),
            )
            .with({ type: "aggregate" }, (aggregateErrorResult) =>
              expectTypeOf(aggregateErrorResult).toExtend<AppAggregateErr>(),
            )
            .exhaustive();
    });
  }
});
