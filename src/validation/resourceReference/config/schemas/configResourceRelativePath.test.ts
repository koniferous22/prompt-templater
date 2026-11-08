import { describe, expect, it } from "bun:test";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  ConfigResourceRelativePathSchema,
  type ConfigResourceRelativePath,
} from "./configResourceRelativePath.js";

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
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<ConfigResourceRelativePath>();
      }
    });
  }
});
