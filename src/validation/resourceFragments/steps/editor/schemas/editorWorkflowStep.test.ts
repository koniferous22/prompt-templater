import { describe, expect, it } from "bun:test";

import type z from "zod";

import { EditorWorkflowStepSchema } from "./editorWorkflowStep.js";

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
      expect(parsingResult.success).toBe(testOutcome.data.result);
    });
  }
});
