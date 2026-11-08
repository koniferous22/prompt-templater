import { describe, it } from "bun:test";
import assert from "node:assert";

import z from "zod";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { createError } from "../neverthrow/errorFactory.js";
import type { AppError } from "../neverthrow/types.js";
import { zodRegisterIssue } from "./zodRegisterIssue.js";

const dummyError1 = createError("dependency_zod_safeParseErrorWithoutIssues", undefined);

const DummyZodSchema = z.union([z.literal(1), z.literal(2)]).check((ctx) => {
  if (ctx.value === 2) {
    // random outlier error that doesn't require no context
    zodRegisterIssue(ctx.value, ctx, "dependency_zod_safeParseErrorWithoutIssues", undefined);
  }
});

const testCasesForZodRegisterIssue = [
  {
    testInput: {
      data: 1,
      testCaseDescription: "valid input value",
    },
    testOutcome: {
      data: {
        parseResult: true,
      },
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: 2,
      testCaseDescription: "invalid input value",
    },
    testOutcome: {
      data: {
        parseResult: false,
        issues: [
          {
            issueCode: "custom",
            issueParams: {
              code: dummyError1.code,
              meta: dummyError1.meta,
            },
          },
        ],
      },
      testBehaviourDescription: "should fail with matching zod issues",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof DummyZodSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          parseResult: true;
        }
      | {
          parseResult: false;
          issues: {
            issueCode: z.core.$ZodIssueCode;
            issueParams: Pick<AppError<AppErrorCode>, "code" | "meta"> | null;
          }[];
        };
    testBehaviourDescription: string;
  };
}[];

describe("zodRegisterIssue", () => {
  describe("DummyZodSchema", () => {
    for (const { testInput, testOutcome } of testCasesForZodRegisterIssue) {
      it(`for ${testInput.testCaseDescription} DummyZodSchema ${testOutcome.testBehaviourDescription}`, async () => {
        const parsingResult = DummyZodSchema.safeParse(testInput.data);
        assert.strictEqual(parsingResult.success, testOutcome.data.parseResult);
        if (!testOutcome.data.parseResult) {
          assert.deepEqual(
            parsingResult.success === false && parsingResult.error.issues.map(({ code }) => code),
            testOutcome.data.issues.map(({ issueCode }) => issueCode),
          );
          assert.deepEqual(
            parsingResult.success === false &&
              parsingResult.error.issues.map((issue) =>
                issue.code === "custom" ? issue.params : null,
              ),
            testOutcome.data.issues.map(({ issueParams }) => issueParams),
          );
        }
      });
    }
  });
});
