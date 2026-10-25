import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { expectTypeOf } from "expect-type";
import { match } from "ts-pattern";
import { z, ZodError } from "zod";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { errFromZodError, resultFromSafeParseResult } from "./resultFromSafeParseResult.js";
import type { AppAggregateErr, AppError } from "./types.js";

const DummyZodSchema = z
  .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
  .check((ctx) => {
    if (ctx.value === 2) {
      ctx.issues.push({
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: [],
        message: "Expected string, received number",
      } as any);
    }
    if (ctx.value === 3) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        path: [],
        message: "custom error",
        params: {
          code: "dependency_nodeFs_fsReadDir_invalidOuptutShape",
          meta: { value: 3 },
        },
      });
    }
    if (ctx.value === 4) {
      ctx.issues.push({
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: [],
        message: "Expected string, received number",
      } as any);
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        path: [],
        message: "custom error",
        params: {
          code: "dependency_nodeFs_fsReadDir_invalidOuptutShape",
          meta: { value: 4 },
        },
      });
    }
  });

const testCasesForErrFromZodError = [
  {
    testInput: {
      data: new ZodError([]),
      testCaseDescription: "a ZodError with no issues (outlier input)",
    },
    testOutcome: {
      data: {
        result: false as const,
        error: {
          type: "plain" as const,
          code: "dependency_zod_safeParseErrorWithoutIssues" as const,
        },
      },
      testBehaviourDescription:
        "returns a plain app error with outlier code dependency_zod_safeParseErrorWithoutIssues",
    },
  },
  {
    testInput: {
      data: DummyZodSchema.safeParse(2).error!,
      testCaseDescription: "a ZodError with a single built-in issue",
    },
    testOutcome: {
      data: {
        result: false as const,
        error: {
          type: "plain" as const,
          code: "dependency_zod_validationError" as const,
        },
      },
      testBehaviourDescription: "returns a plain app error with default zod validation error code",
    },
  },
  {
    testInput: {
      data: DummyZodSchema.safeParse(3).error!,
      testCaseDescription: "a ZodError with a single custom issue",
    },
    testOutcome: {
      data: {
        result: false as const,
        error: {
          type: "plain" as const,
          code: "dependency_nodeFs_fsReadDir_invalidOuptutShape" as const,
        },
      },
      testBehaviourDescription: "returns a plain app error with custom code",
    },
  },
  {
    testInput: {
      data: DummyZodSchema.safeParse(4).error!,
      testCaseDescription: "a ZodError with multiple issues (built-in and custom)",
    },
    testOutcome: {
      data: {
        result: false as const,
        error: {
          type: "aggregate" as const,
          codes: [
            "dependency_zod_validationError",
            "dependency_nodeFs_fsReadDir_invalidOuptutShape",
          ] as const,
        },
      },
      testBehaviourDescription: "returns an aggregate app error",
    },
  },
] satisfies {
  testInput: {
    data: ZodError<any>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: false;
      error:
        | {
            type: "plain";
            code:
              | "dependency_zod_safeParseErrorWithoutIssues"
              | "dependency_zod_validationError"
              | "dependency_nodeFs_fsReadDir_invalidOuptutShape";
          }
        | {
            type: "aggregate";
            codes: readonly (
              | "dependency_zod_validationError"
              | "dependency_nodeFs_fsReadDir_invalidOuptutShape"
            )[];
          };
    };
    testBehaviourDescription: string;
  };
}[];

describe("errFromZodError", () => {
  for (const { testInput, testOutcome } of testCasesForErrFromZodError) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, () => {
      const actualResult = errFromZodError(testInput.data);

      assert.strictEqual(actualResult.isOk(), testOutcome.data.result);
      assert.ok(actualResult.isErr());

      const actualError = actualResult.error;

      if (testOutcome.data.error.type === "plain") {
        assert.strictEqual(actualError.type, "plain");
        assert.strictEqual(actualError.code, testOutcome.data.error.code);
      } else {
        assert.strictEqual(actualError.type, "aggregate");
        assert.strictEqual(actualError.errors.length, testOutcome.data.error.codes.length);
        testOutcome.data.error.codes.forEach((expectedCode, index) => {
          assert.strictEqual(
            actualError.errors[index] && actualError.errors[index].code,
            expectedCode,
          );
        });
      }
      match(actualError)
        .with({ type: "plain" }, (plainError) =>
          expectTypeOf(plainError).toExtend<AppError<AppErrorCode>>(),
        )
        .with({ type: "aggregate" }, (aggregateError) =>
          expectTypeOf(aggregateError).toExtend<AppAggregateErr>(),
        )
        .exhaustive();
    });
  }
});

const testCasesForResultFromSafeParseResult = [
  {
    testInput: {
      data: DummyZodSchema.safeParse(1),
      testCaseDescription: "a successful safeParse result",
    },
    testOutcome: {
      data: {
        result: true as const,
        value: 1 as const,
      },
      testBehaviourDescription: "returns ok(1)",
    },
  },
  {
    testInput: {
      data: DummyZodSchema.safeParse(2),
      testCaseDescription: "a safeParse result with a single built-in issue",
    },
    testOutcome: {
      data: {
        result: false as const,
        error: {
          type: "plain" as const,
          code: "dependency_zod_validationError" as const,
        },
      },
      testBehaviourDescription: "returns a plain app error with default zod validation error code",
    },
  },
  {
    testInput: {
      data: DummyZodSchema.safeParse(3),
      testCaseDescription: "a safeParse result with a single custom issue",
    },
    testOutcome: {
      data: {
        result: false as const,
        error: {
          type: "plain" as const,
          code: "dependency_nodeFs_fsReadDir_invalidOuptutShape" as const,
        },
      },
      testBehaviourDescription: "returns a plain app error with custom code",
    },
  },
  {
    testInput: {
      data: DummyZodSchema.safeParse(4),
      testCaseDescription: "a safeParse result with multiple issues (built-in and custom)",
    },
    testOutcome: {
      data: {
        result: false as const,
        error: {
          type: "aggregate" as const,
          codes: [
            "dependency_zod_validationError",
            "dependency_nodeFs_fsReadDir_invalidOuptutShape",
          ] as const,
        },
      },
      testBehaviourDescription: "returns an aggregate app error",
    },
  },
] satisfies {
  testInput: {
    data: z.ZodSafeParseResult<1 | 2 | 3 | 4>;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          value: 1;
        }
      | {
          result: false;
          error:
            | {
                type: "plain";
                code:
                  | "dependency_zod_validationError"
                  | "dependency_nodeFs_fsReadDir_invalidOuptutShape";
              }
            | {
                type: "aggregate";
                codes: readonly (
                  | "dependency_zod_validationError"
                  | "dependency_nodeFs_fsReadDir_invalidOuptutShape"
                )[];
              };
        };
    testBehaviourDescription: string;
  };
}[];

describe("resultFromSafeParseResult", () => {
  for (const { testInput, testOutcome } of testCasesForResultFromSafeParseResult) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, () => {
      const actualResult = resultFromSafeParseResult(testInput.data);

      assert.strictEqual(actualResult.isOk(), testOutcome.data.result);

      if (testOutcome.data.result === true) {
        assert.ok(actualResult.isOk());
        assert.deepStrictEqual(actualResult.value, testOutcome.data.value);
      } else {
        assert.ok(actualResult.isErr());
        const actualError = actualResult.error;

        if (testOutcome.data.error.type === "plain") {
          assert.strictEqual(actualError.type, "plain");
          assert.strictEqual(actualError.code, testOutcome.data.error.code);
        } else {
          assert.strictEqual(actualError.type, "aggregate");
          assert.strictEqual(actualError.errors.length, testOutcome.data.error.codes.length);
          testOutcome.data.error.codes.forEach((expectedCode, index) => {
            assert.strictEqual(
              actualError.errors[index] && actualError.errors[index].code,
              expectedCode,
            );
          });
        }
      }
      if (actualResult.isErr()) {
        match(actualResult.error)
          .with({ type: "plain" }, (plainError) =>
            expectTypeOf(plainError).toExtend<AppError<AppErrorCode>>(),
          )
          .with({ type: "aggregate" }, (aggregateError) =>
            expectTypeOf(aggregateError).toExtend<AppAggregateErr>(),
          )
          .exhaustive();
      }
    });
  }
});
