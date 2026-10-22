import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { z } from "zod";

import { buildUnionOptionsFromEnum } from "./zodUnionFromEnum.js";

const SingleValueEnum = {
  Only: "only",
} as const;

const MultiValueEnum = {
  Number: "number",
  String: "string",
  Boolean: "boolean",
} as const;

const EnumWithDuplicates = {
  A: "same",
  B: "same",
  C: "different",
} as const;

const MixedEnum = {
  Str: "hello",
  Num: 42,
} as const;

const testCasesForBuildUnionOptionsFromEnum = [
  {
    testInput: {
      data: SingleValueEnum,
      testCaseDescription: "a single-value enum",
    },
    testOutcome: {
      testBehaviourDescription: "return a non-empty array containing exactly one z.literal schema",
      data: [z.literal("only")] as ReturnType<typeof buildUnionOptionsFromEnum>,
    },
  },
  {
    testInput: {
      data: MultiValueEnum,
      testCaseDescription: "a multi-value string enum",
    },
    testOutcome: {
      testBehaviourDescription:
        "return a non-empty array of z.literal schemas for every unique value",
      data: [z.literal("number"), z.literal("string"), z.literal("boolean")] as ReturnType<
        typeof buildUnionOptionsFromEnum
      >,
    },
  },
  {
    testInput: {
      data: EnumWithDuplicates,
      testCaseDescription: "an enum containing duplicate values",
    },
    testOutcome: {
      testBehaviourDescription: "deduplicate values and return only unique z.literal schemas",
      data: [z.literal("same"), z.literal("different")] as ReturnType<
        typeof buildUnionOptionsFromEnum
      >,
    },
  },
  {
    testInput: {
      data: MixedEnum,
      testCaseDescription: "an enum mixing string and number values",
    },
    testOutcome: {
      testBehaviourDescription:
        "return z.literal schemas preserving both string and number literals",
      data: [z.literal("hello"), z.literal(42)] as ReturnType<typeof buildUnionOptionsFromEnum>,
    },
  },
] satisfies {
  testInput: {
    data: Parameters<typeof buildUnionOptionsFromEnum>[0];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: ReturnType<typeof buildUnionOptionsFromEnum>;
  };
}[];

describe("buildUnionOptionsFromEnum", () => {
  for (const { testInput, testOutcome } of testCasesForBuildUnionOptionsFromEnum) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = buildUnionOptionsFromEnum(testInput.data as any);

      assert.equal(result.length, testOutcome.data.length);
      assert.ok(result.length >= 1, "result must be a non-empty array");

      // Each element is a Zod schema (literal in practice)
      for (const schema of result) {
        assert.ok(schema && typeof schema === "object");
        assert.ok("parse" in schema);
      }

      // Optional deeper check: the set of literal values matches
      const resultValues = result.map((s) => (s as unknown as z.ZodLiteral<any>).value);
      const expectedValues = testOutcome.data.map((s) => (s as z.ZodLiteral<any>).value);
      assert.deepEqual([...resultValues].sort(), [...expectedValues].sort());
    });
  }
});
