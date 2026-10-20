import assert from "node:assert";
import { describe, it } from "node:test";
import type z from "zod";

import { InputPromptOptionalValidationErrorMessageShorthandSchema } from "./inputPromptOptionalValidation.js";
import { NonEmptyStringSchema } from "../../../../../string/customTypes/string.js";

const testCasesForInputPromptOptionalValidationErrorMessageShorthandSchema = [
  {
    testInput: {
      data: undefined,
      testCaseDescription: '"undefined" input'
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          typeErrorMessage: undefined,
        },
      },
      testBehaviourDescription: 'should succeed with no override'
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse('message override'),
      testCaseDescription: 'non-empty string input'
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          typeErrorMessage: NonEmptyStringSchema.parse('message override'),
        },
      },
      testBehaviourDescription: 'should succeed'
    },
  },
  {
    testInput: {
      data: {
        typeErrorMessage: NonEmptyStringSchema.parse('non-empty string input'),
      },
      testCaseDescription: 'full object input'
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          typeErrorMessage: NonEmptyStringSchema.parse('non-empty string input'),
        },
      },
      testBehaviourDescription: 'should succeed'
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof InputPromptOptionalValidationErrorMessageShorthandSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
    | {
      result: true;
      parsedValue: z.output<typeof InputPromptOptionalValidationErrorMessageShorthandSchema>;
    }
    | {
      result: false;
    }
    testBehaviourDescription: string;
  }
}[];

describe("InputPromptOptionalValidationErrorMessageShorthandSchema", () => {
  for (const { testInput, testOutcome } of testCasesForInputPromptOptionalValidationErrorMessageShorthandSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = InputPromptOptionalValidationErrorMessageShorthandSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (testOutcome.data.result) {
        assert.deepEqual(parsingResult.data, testOutcome.data.parsedValue);
      }
    });
  }
});
