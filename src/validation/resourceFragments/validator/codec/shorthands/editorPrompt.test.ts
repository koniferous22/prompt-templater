import { describe, it } from "bun:test";
import assert from "node:assert";

import type z from "zod";

import { NonEmptyStringSchema } from "../../../../string/customTypes/string.js";
import { EditorPromptValidationShorthandSchema } from "./editorPrompt.js";

const testCasesForEditorPromptValidationShorthandSchema = [
  {
    testInput: {
      data: "optional",
      testCaseDescription: 'string literal "optional"',
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          type: "optional",
        },
      },
      testBehaviourDescription: "should succeed with undefined error message override",
    },
  },
  {
    testInput: {
      data: "required",
      testCaseDescription: 'string literal "required"',
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          type: "required",
        },
      },
      testBehaviourDescription: "should succeed with undefined error message override",
    },
  },
  {
    testInput: {
      data: {
        type: "optional",
        error: "error message override",
      },
      testCaseDescription: 'full object input with "optional" validation type',
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          type: "optional",
          error: {
            typeErrorMessage: NonEmptyStringSchema.parse("error message override"),
          },
        },
      },
      testBehaviourDescription: "should succeed with overridden error message",
    },
  },
  {
    testInput: {
      data: {
        type: "required",
        error: {
          requiredErrorMessage: "error message override",
        },
      },
      testCaseDescription: 'full object input with "required" validation type',
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          type: "required",
          error: {
            requiredErrorMessage: NonEmptyStringSchema.parse("error message override"),
          },
        },
      },
      testBehaviourDescription: "should succeed with overridden error message",
    },
  },
  {
    testInput: {
      data: {
        type: "optionalWithDefault",
        value: "default string",
        error: "error message override",
      },
      testCaseDescription: 'full object input with "required" validation type',
    },
    testOutcome: {
      data: {
        result: true,
        parsedValue: {
          type: "optionalWithDefault",
          value: NonEmptyStringSchema.parse("default string"),
          error: {
            typeErrorMessage: NonEmptyStringSchema.parse("error message override"),
          },
        },
      },
      testBehaviourDescription: "should succeed with overridden error message",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof EditorPromptValidationShorthandSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          parsedValue: z.output<typeof EditorPromptValidationShorthandSchema>;
        }
      | {
          result: false;
        };
    testBehaviourDescription: string;
  };
}[];

describe("EditorPromptValidationShorthandSchema", () => {
  for (const { testInput, testOutcome } of testCasesForEditorPromptValidationShorthandSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = EditorPromptValidationShorthandSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (testOutcome.data.result) {
        assert.deepEqual(parsingResult.data, testOutcome.data.parsedValue);
      }
    });
  }
});
