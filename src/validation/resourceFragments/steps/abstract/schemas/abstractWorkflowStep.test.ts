import { describe, it } from "bun:test";
import assert from "node:assert";

import type z from "zod";

import { AbstractWorkflowStepSchema } from "./abstractWorkflowStep.js";

const testCasesForAbstractWorkflowStepSchema = [
  {
    testInput: {
      data: {
        id: "stepId",
      },
      testCaseDescription: "input without target variable override",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "stepId",
        targetVariable: "targetVariable",
      },
      testCaseDescription: "input with target variable override",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof AbstractWorkflowStepSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: boolean;
    };
    testBehaviourDescription: string;
  };
}[];

describe("AbstractWorkflowStepSchema", () => {
  for (const { testInput, testOutcome } of testCasesForAbstractWorkflowStepSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = AbstractWorkflowStepSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
