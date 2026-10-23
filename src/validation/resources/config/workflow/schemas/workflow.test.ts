import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { WorkflowSchema } from "./workflow.js";

const testCasesForWorkflowSchema = [
  {
    testInput: {
      data: {
        templateFile: "templates/test-template.hbs",
        steps: [
          {
            id: "step1",
            type: "select",
            message: "choose an option",
            valueType: "string",
            choices: ["value1", "value2"],
          },
        ],
      },
      testCaseDescription: "example workflow",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof WorkflowSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("WorkflowSchema", () => {
  for (const { testInput, testOutcome } of testCasesForWorkflowSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = WorkflowSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
    });
  }
});
