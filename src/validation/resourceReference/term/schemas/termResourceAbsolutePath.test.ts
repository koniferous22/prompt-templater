import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  TermResourceAbsolutePathSchema,
  type TermResourceAbsolutePath,
} from "./termResourceAbsolutePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForTermResourceAbsolutePathSchema = [
  {
    testInput: {
      data: {
        format: "json",
        path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.json"),
        selector: null,
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
        format: "json",
        path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.json"),
        selector: ["key", 0],
      },
      testCaseDescription: "valid .json input with selector",
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
        path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.yml"),
        selector: null,
      },
      testCaseDescription: "valid .yaml input",
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
        path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.yml"),
        selector: ["key", 0],
      },
      testCaseDescription: "valid .yaml input with selector",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        format: "plaintext",
        path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.txt"),
      },
      testCaseDescription: "valid plaintext input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof TermResourceAbsolutePathSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("TermResourceAbsolutePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTermResourceAbsolutePathSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = TermResourceAbsolutePathSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermResourceAbsolutePath>();
      }
    });
  }
});
