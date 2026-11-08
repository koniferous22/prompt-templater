import { describe, it } from "bun:test";
import assert from "node:assert";

import type z from "zod";

import { NonEmptyStringSchema } from "../../../../../string/customTypes/string.js";
import { EditorPromptOptionalValidationErrorMessageShorthandSchema } from "./editorPromptOptionalValidation.js";

const testCasesForEditorPromptOptionalValidationErrorMessageShorthandSchema = [
  {
    testInput: {
      data: undefined,
      testCaseDescription: '"undefined" input',
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          typeErrorMessage: undefined,
        },
      },
      testBehaviourDescription: "should succeed with no override",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("message override"),
      testCaseDescription: "non-empty string input",
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          typeErrorMessage: NonEmptyStringSchema.parse("message override"),
        },
      },
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        typeErrorMessage: NonEmptyStringSchema.parse("non-empty string input"),
      },
      testCaseDescription: "full object input",
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          typeErrorMessage: NonEmptyStringSchema.parse("non-empty string input"),
        },
      },
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof EditorPromptOptionalValidationErrorMessageShorthandSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          parsedValue: z.output<typeof EditorPromptOptionalValidationErrorMessageShorthandSchema>;
        }
      | {
          result: false;
        };
    testBehaviourDescription: string;
  };
}[];

describe("EditorPromptOptionalValidationErrorMessageShorthandSchema", () => {
  for (const {
    testInput,
    testOutcome,
  } of testCasesForEditorPromptOptionalValidationErrorMessageShorthandSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = EditorPromptOptionalValidationErrorMessageShorthandSchema.safeParse(
        testInput.data,
      );
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (testOutcome.data.result) {
        assert.deepEqual(parsingResult.data, testOutcome.data.parsedValue);
      }
    });
  }
});
