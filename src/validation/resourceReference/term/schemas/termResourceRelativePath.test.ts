import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  TermResourceRelativePathSchema,
  type TermResourceRelativePath,
} from "./termResourceRelativePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForTermResourceRelativePathSchema = [
  {
    testInput: {
      data: {
        format: "json",
        path: "fixtures/workspace1/terms/test-term.json",
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
        path: "fixtures/workspace1/terms/test-term.json",
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
        path: "fixtures/workspace1/terms/test-term.yml",
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
        path: "fixtures/workspace1/terms/test-term.yml",
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
        path: "fixtures/workspace1/terms/test-term.txt",
        options: {
          whitespaceLines: "skipTrailing",
          trimWhitespace: true,
        },
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
    data: z.input<typeof TermResourceRelativePathSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("TermResourceRelativePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTermResourceRelativePathSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = TermResourceRelativePathSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermResourceRelativePath>();
      }
    });
  }
});
