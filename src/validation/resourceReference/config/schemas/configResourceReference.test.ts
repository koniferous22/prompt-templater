import { describe, it } from "bun:test";
import assert from "node:assert";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  ConfigResourceReferenceSchema,
  type ConfigResourceReference,
} from "./configResourceReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForConfigResourceReferenceSchema = [
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "json",
          path: join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.json"),
        },
      },
      testCaseDescription: "valid absolute json workflow input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "yaml",
          path: join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.yml"),
        },
      },
      testCaseDescription: "valid absolute yaml workflow input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "relative",
        filePath: {
          format: "json",
          path: "workflows/test-workflow.json",
        },
      },
      testCaseDescription: "valid relative json workflow input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "relative",
        filePath: {
          format: "yaml",
          path: "workflows/test-workflow.yml",
        },
      },
      testCaseDescription: "valid relative yaml workflow input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof ConfigResourceReferenceSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("ConfigResourceReferenceSchema", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceReferenceSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = ConfigResourceReferenceSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<ConfigResourceReference>();
      }
    });
  }
});
