import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { EditorWorkflowStepSchema } from "./editor.js";

const testCasesForEditorWorkflowStepSchema = [
  {
    testInput: {
      data: {
        id: "step-1",
        type: "editor",
        message: "Please provide input",
        validation: "optional",
      },
      testCaseDescription: "minimal valid object with validation as string literal 'optional'",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: { result: true },
    },
  },
  {
    testInput: {
      data: {
        id: "step-2",
        type: "editor",
        message: "Required field",
        validation: "required",
      },
      testCaseDescription: "valid object with validation as string literal 'required'",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: { result: true },
    },
  },
  {
    testInput: {
      data: {
        id: "step-3",
        type: "editor",
        message: "With default",
        validation: {
          type: "optionalWithDefault",
          value: "default-value",
        },
      },
      testCaseDescription: "valid object with validation as object form 'optionalWithDefault'",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: { result: true },
    },
  },
  {
    testInput: {
      data: {
        id: "step-4",
        targetVariable: "myVar",
        type: "editor",
        message: "Message with target",
        validation: "optional",
      },
      testCaseDescription: "valid object including optional targetVariable",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: { result: true },
    },
  },
  {
    testInput: {
      data: {
        id: "step-5",
        type: "editor",
        message: "Full object validation",
        validation: {
          type: "optional",
        },
      },
      testCaseDescription: "valid object with validation as object form 'optional'",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: { result: true },
    },
  },
  {
    testInput: {
      data: {
        id: "step-6",
        type: "editor",
        message: "Full object validation required",
        validation: {
          type: "required",
        },
      },
      testCaseDescription: "valid object with validation as object form 'required'",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: { result: true },
    },
  },
  {
    testInput: {
      data: {
        id: "",
        type: "editor",
        message: "Empty id",
        validation: "optional",
      },
      testCaseDescription: "empty string for required NonEmptyString id",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
  {
    testInput: {
      data: {
        id: "step-7",
        type: "editor",
        message: "",
        validation: "optional",
      },
      testCaseDescription: "empty string for required NonEmptyString message",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
  {
    testInput: {
      data: {
        id: "step-8",
        type: "editor",
        message: "Missing validation",
      },
      testCaseDescription: "missing required validation field",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
  {
    testInput: {
      data: {
        id: "step-9",
        type: "wrong-type",
        message: "Wrong type",
        validation: "optional",
      },
      testCaseDescription: "incorrect literal value for type field",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
  {
    testInput: {
      data: {
        id: "step-10",
        type: "editor",
        message: "Invalid validation string",
        validation: "invalid",
      },
      testCaseDescription: "invalid string value for validation (not optional/required)",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
  {
    testInput: {
      data: {
        id: "step-11",
        type: "editor",
        message: "Invalid validation object",
        validation: {
          type: "optionalWithDefault",
          value: "",
        },
      },
      testCaseDescription: "validation object with empty NonEmptyString value",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
  {
    testInput: {
      data: {
        id: "step-12",
        type: "editor",
        message: "Invalid validation object type",
        validation: {
          type: "unknown",
        },
      },
      testCaseDescription: "validation object with unknown type discriminator",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
  {
    testInput: {
      data: {
        id: "step-13",
        targetVariable: "",
        type: "editor",
        message: "Empty optional targetVariable",
        validation: "optional",
      },
      testCaseDescription: "empty string for optional NonEmptyString targetVariable",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
  {
    testInput: {
      data: {
        type: "editor",
        message: "Missing id",
        validation: "optional",
      } as any,
      testCaseDescription: "missing required id field",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: { result: false },
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof EditorWorkflowStepSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("EditorWorkflowStepSchema", () => {
  for (const { testInput, testOutcome } of testCasesForEditorWorkflowStepSchema) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = EditorWorkflowStepSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
