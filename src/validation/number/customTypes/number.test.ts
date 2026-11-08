import { describe, it } from "bun:test";
import assert from "node:assert";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { NonNegativeIntegerSchema, type NonNegativeInteger } from "./number.js";

const testCasesForNonEmptyStringSchema = [
  {
    testInput: 1,
    testOutcome: true,
  },
  {
    testInput: -1,
    testOutcome: false,
  },
  {
    testInput: 1.5,
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof NonNegativeIntegerSchema>;
  testOutcome: boolean;
}[];

describe("NonEmptyStringSchema", () => {
  for (const { testInput, testOutcome } of testCasesForNonEmptyStringSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = NonNegativeIntegerSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<NonNegativeInteger>();
      }
    });
  }
});
