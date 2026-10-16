import z from "zod";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppError } from "../neverthrow/types.js";
import { zodRegisterIssue } from "./zodRegisterIssue.js";
import { describe, it } from "node:test";
import { createError } from "../neverthrow/errorFactory.js";
import assert from "node:assert";
import { zodIssueFromAppError } from "./zodIssueFromAppError.js";

const dummyError1 = createError('dependency_zod_safeParseErrorWithoutIssues', undefined);

const testCasesForZodIssueFromAppError = [
  {
    testInput: {
      data: {
        params: [
          dummyError1,
          1,
          {
            path: [],
            continue: false,
          }
        ],
      },
      testCaseDescription: "sample data",
    },
    testOutcome: {
      data: {
        result: {
          code: 'custom',
          path: [],
          message: dummyError1.message,
          input: 1,
          continue: false,
          params: {
            code: dummyError1.code,
            meta: dummyError1.meta,
          }
        }
      },
      testBehaviourDescription: "should return mapped zod issue",
    },
  },
] satisfies {
  testInput: {
    data: {
      params: Parameters<typeof zodIssueFromAppError>;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: ReturnType<typeof zodIssueFromAppError>;
    }
    testBehaviourDescription: string;
  };
}[];

describe('zodIssueFromAppError', () => {
  for (const { testInput, testOutcome } of testCasesForZodIssueFromAppError) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const result = zodIssueFromAppError(...testInput.data.params);
      assert.deepEqual(result, testOutcome.data.result);
    });
  }
})

