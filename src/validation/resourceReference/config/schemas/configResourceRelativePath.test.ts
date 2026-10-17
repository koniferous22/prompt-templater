import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { ConfigResourceRelativePathSchema } from "./configResourceRelativePath.js";

const testCasesForConfigResourceRelativePathSchema = [
  {
    testInput: {
      data: {
        format: "json",
        path: "workflows/test-workflow.json",
      },
      testCaseDescription: "valid .json input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        format: "yaml",
        path: "workflows/test-workflow.yml",
      },
      testCaseDescription: "valid .yaml input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof ConfigResourceRelativePathSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("ConfigResourceRelativePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceRelativePathSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = ConfigResourceRelativePathSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
    });
  }
});
