import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  ConfigResourceAbsolutePathSchema,
  type ConfigResourceAbsolutePath,
} from "./configResourceAbsolutePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForConfigResourceAbsolutePathSchema = [
  {
    testInput: {
      data: {
        format: "json",
        path: join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.json"),
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
        path: join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.yml"),
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
    data: z.input<typeof ConfigResourceAbsolutePathSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("ConfigResourceAbsolutePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceAbsolutePathSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = ConfigResourceAbsolutePathSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<ConfigResourceAbsolutePath>();
      }
    });
  }
});
