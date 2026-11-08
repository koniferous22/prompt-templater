import { describe, expect, it } from "bun:test";

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
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<NonEmptyString>();
      }
    });
  }
});
