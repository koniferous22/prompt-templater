import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { BooleanStringSchema } from "./booleanString.js";

const testCasesForBooleanStringSchema = [
  {
    testInput: "true",
    testOutcome: true,
  },
  {
    testInput: "false",
    testOutcome: true,
  },
  {
    testInput: "TRUE",
    testOutcome: true,
  },
  {
    testInput: "FALSE",
    testOutcome: true,
  },
  {
    testInput: "invalid-input",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof BooleanStringSchema>;
  testOutcome: boolean;
}[];

describe("BooleanStringSchema", () => {
  for (const { testInput, testOutcome } of testCasesForBooleanStringSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = BooleanStringSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});
