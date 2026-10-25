import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type z from "zod";

import { PlainFileTermReferenceOptionsSchema } from "./plainFileReferenceOptions.js";

const testCasesForPlainFileReferenceOptionsSchema = [
  {
    testInput: {
      data: {
        whitespaceLines: "skipTrailing",
        trimWhitespace: false,
      },
      testCaseDescription: "object with parsing options",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof PlainFileTermReferenceOptionsSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: boolean;
    };
    testBehaviourDescription: string;
  };
}[];

describe("PlainFileReferenceOptionsSchema", () => {
  for (const { testInput, testOutcome } of testCasesForPlainFileReferenceOptionsSchema) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = PlainFileTermReferenceOptionsSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
