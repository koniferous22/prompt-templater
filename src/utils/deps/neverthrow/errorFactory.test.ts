import { describe, it } from "bun:test";
import assert from "node:assert/strict";

import { expectTypeOf } from "expect-type";
import { z, ZodError } from "zod";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import {
  createError,
  createAggregateError,
  appErr,
  appErrAsync,
  appAggregateErr,
  appAggregateErrAsync,
} from "./errorFactory.js";
import type { AppError, AppAggregateErr } from "./types.js";

const sampleZodError = new ZodError([]);

const testCasesForCreateError = [
  {
    testInput: {
      code: "dependency_zod_safeParseErrorWithoutIssues" as const,
      meta: undefined,
      opts: { cause: "test-cause" },
      testCaseDescription: "dependency_zod_safeParseErrorWithoutIssues with cause",
    },
    testOutcome: {
      data: {
        type: "plain" as const,
        code: "dependency_zod_safeParseErrorWithoutIssues" as const,
      } satisfies Pick<AppError<"dependency_zod_safeParseErrorWithoutIssues">, "type" | "code">,
      testBehaviourDescription: "returns a plain AppError with the given code",
    },
  },
] satisfies {
  testInput: {
    code: "dependency_zod_safeParseErrorWithoutIssues";
    meta: undefined;
    opts: { cause: string };
    testCaseDescription: string;
  };
  testOutcome: {
    data: { type: "plain"; code: "dependency_zod_safeParseErrorWithoutIssues" };
    testBehaviourDescription: string;
  };
}[];

describe("createError", () => {
  for (const { testInput, testOutcome } of testCasesForCreateError) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, () => {
      const actual = createError(testInput.code, testInput.meta, testInput.opts);

      assert.strictEqual(actual.type, testOutcome.data.type);
      assert.strictEqual(actual.code, testOutcome.data.code);
      expectTypeOf(actual).toEqualTypeOf<AppError<"dependency_zod_safeParseErrorWithoutIssues">>();
    });
  }
});

const testCasesForCreateAggregateError = [
  {
    testInput: {
      errors: [
        createError("dependency_zod_validationError", { zodError: sampleZodError }),
        createError("dependency_nodeFs_fsReadDir_invalidOuptutShape", undefined),
      ] as const,
      testCaseDescription: "two plain AppErrors",
    },
    testOutcome: {
      data: {
        type: "aggregate" as const,
        codes: [
          "dependency_zod_validationError",
          "dependency_nodeFs_fsReadDir_invalidOuptutShape",
        ] as const,
      },
      testBehaviourDescription: "returns an AppAggregateErr containing the provided errors",
    },
  },
] satisfies {
  testInput: {
    errors: readonly [
      AppError<"dependency_zod_validationError">,
      AppError<"dependency_nodeFs_fsReadDir_invalidOuptutShape">,
    ];
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      type: "aggregate";
      codes: readonly [
        "dependency_zod_validationError",
        "dependency_nodeFs_fsReadDir_invalidOuptutShape",
      ];
    };
    testBehaviourDescription: string;
  };
}[];

describe("createAggregateError", () => {
  for (const { testInput, testOutcome } of testCasesForCreateAggregateError) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, () => {
      const actual = createAggregateError(...testInput.errors);

      assert.strictEqual(actual.type, testOutcome.data.type);
      assert.strictEqual(actual.errors.length, testOutcome.data.codes.length);
      testOutcome.data.codes.forEach((expectedCode, index) => {
        assert.strictEqual(actual.errors[index] && actual.errors[index].code, expectedCode);
      });
      expectTypeOf(actual).toExtend<AppAggregateErr>();
    });
  }
});

const testCasesForAppErr = [
  {
    testInput: {
      code: "dependency_zod_validationError" as const,
      meta: { zodError: sampleZodError },
      opts: { cause: sampleZodError },
      testCaseDescription: "dependency_zod_validationError with cause",
    },
    testOutcome: {
      data: {
        isOk: false as const,
        error: {
          type: "plain" as const,
          code: "dependency_zod_validationError" as const,
        },
      },
      testBehaviourDescription: "returns a neverthrow err Result wrapping a plain AppError",
    },
  },
] satisfies {
  testInput: {
    code: "dependency_zod_validationError";
    meta: { zodError: ZodError<any> };
    opts: { cause: ZodError<any> };
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      isOk: false;
      error: { type: "plain"; code: "dependency_zod_validationError" };
    };
    testBehaviourDescription: string;
  };
}[];

describe("appErr", () => {
  for (const { testInput, testOutcome } of testCasesForAppErr) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, () => {
      const actual = appErr(testInput.code, testInput.meta, testInput.opts);

      assert.ok(actual.isErr());
      assert.strictEqual(actual.error.type, testOutcome.data.error.type);
      assert.strictEqual(actual.error.code, testOutcome.data.error.code);
      expectTypeOf(actual.error).toExtend<AppError<AppErrorCode>>();
    });
  }
});

const testCasesForAppErrAsync = [
  {
    testInput: {
      code: "dependency_nodeFs_fsReadDir_invalidOuptutShape" as const,
      meta: { value: 99 },
      opts: undefined,
      testCaseDescription: "dependency_nodeFs_fsReadDir_invalidOuptutShape without opts",
    },
    testOutcome: {
      data: {
        isOk: false as const,
        error: {
          type: "plain" as const,
          code: "dependency_nodeFs_fsReadDir_invalidOuptutShape" as const,
        },
      },
      testBehaviourDescription:
        "returns a neverthrow errAsync ResultAsync wrapping a plain AppError",
    },
  },
] satisfies {
  testInput: {
    code: "dependency_nodeFs_fsReadDir_invalidOuptutShape";
    meta: { value: number };
    opts: undefined;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      isOk: false;
      error: { type: "plain"; code: "dependency_nodeFs_fsReadDir_invalidOuptutShape" };
    };
    testBehaviourDescription: string;
  };
}[];

describe("appErrAsync", () => {
  for (const { testInput, testOutcome } of testCasesForAppErrAsync) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const actual = await appErrAsync(testInput.code, undefined, testInput.opts);

      assert.ok(actual.isErr());
      assert.strictEqual(actual.error.type, testOutcome.data.error.type);
      assert.strictEqual(actual.error.code, testOutcome.data.error.code);
      expectTypeOf(actual.error).toExtend<AppError<AppErrorCode>>();
    });
  }
});

const testCasesForAppAggregateErr = [
  {
    testInput: {
      errors: [
        createError("dependency_zod_safeParseErrorWithoutIssues", undefined),
        createError("dependency_zod_validationError", { zodError: sampleZodError }),
      ] as const,
      testCaseDescription: "two plain AppErrors",
    },
    testOutcome: {
      data: {
        isOk: false as const,
        error: {
          type: "aggregate" as const,
          codes: [
            "dependency_zod_safeParseErrorWithoutIssues",
            "dependency_zod_validationError",
          ] as const,
        },
      },
      testBehaviourDescription: "returns a neverthrow err Result wrapping an AppAggregateErr",
    },
  },
] satisfies {
  testInput: {
    errors: readonly [
      AppError<"dependency_zod_safeParseErrorWithoutIssues">,
      AppError<"dependency_zod_validationError">,
    ];
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      isOk: false;
      error: {
        type: "aggregate";
        codes: readonly [
          "dependency_zod_safeParseErrorWithoutIssues",
          "dependency_zod_validationError",
        ];
      };
    };
    testBehaviourDescription: string;
  };
}[];

describe("appAggregateErr", () => {
  for (const { testInput, testOutcome } of testCasesForAppAggregateErr) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, () => {
      const actual = appAggregateErr(...testInput.errors);

      assert.ok(actual.isErr());
      assert.strictEqual(actual.error.type, testOutcome.data.error.type);
      assert.strictEqual(actual.error.errors.length, testOutcome.data.error.codes.length);
      testOutcome.data.error.codes.forEach((expectedCode, index) => {
        assert.strictEqual(
          actual.error.errors[index] && actual.error.errors[index].code,
          expectedCode,
        );
      });
      expectTypeOf(actual.error).toExtend<AppAggregateErr>();
    });
  }
});

const testCasesForAppAggregateErrAsync = [
  {
    testInput: {
      errors: [
        createError("dependency_nodeFs_fsReadDir_invalidOuptutShape", undefined),
        createError("dependency_zod_validationError", { zodError: sampleZodError }),
      ] as const,
      testCaseDescription: "two plain AppErrors",
    },
    testOutcome: {
      data: {
        isOk: false as const,
        error: {
          type: "aggregate" as const,
          codes: [
            "dependency_nodeFs_fsReadDir_invalidOuptutShape",
            "dependency_zod_validationError",
          ] as const,
        },
      },
      testBehaviourDescription:
        "returns a neverthrow errAsync ResultAsync wrapping an AppAggregateErr",
    },
  },
] satisfies {
  testInput: {
    errors: readonly [
      AppError<"dependency_nodeFs_fsReadDir_invalidOuptutShape">,
      AppError<"dependency_zod_validationError">,
    ];
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      isOk: false;
      error: {
        type: "aggregate";
        codes: readonly [
          "dependency_nodeFs_fsReadDir_invalidOuptutShape",
          "dependency_zod_validationError",
        ];
      };
    };
    testBehaviourDescription: string;
  };
}[];

describe("appAggregateErrAsync", () => {
  for (const { testInput, testOutcome } of testCasesForAppAggregateErrAsync) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const actual = await appAggregateErrAsync(...testInput.errors);

      assert.ok(actual.isErr());
      assert.strictEqual(actual.error.type, testOutcome.data.error.type);
      assert.strictEqual(actual.error.errors.length, testOutcome.data.error.codes.length);
      testOutcome.data.error.codes.forEach((expectedCode, index) => {
        assert.strictEqual(
          actual.error.errors[index] && actual.error.errors[index].code,
          expectedCode,
        );
      });
      expectTypeOf(actual.error).toExtend<AppAggregateErr>();
    });
  }
});
