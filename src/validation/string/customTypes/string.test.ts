import assert from "node:assert";
import { describe, it } from "node:test";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { NonEmptyStringSchema, type NonEmptyString } from "./string.js";

const testCasesForNonEmptyStringSchema = [
  {
    testInput: "hello",
    testOutcome: true,
  },
  {
    testInput: "",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof NonEmptyStringSchema>;
  testOutcome: boolean;
}[];

describe("NonEmptyStringSchema", () => {
  for (const { testInput, testOutcome } of testCasesForNonEmptyStringSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = NonEmptyStringSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<NonEmptyString>();
      }
    });
  }
});
