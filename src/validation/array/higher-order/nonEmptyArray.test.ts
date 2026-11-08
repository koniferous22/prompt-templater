import { describe, expect, it } from "bun:test";

import { expectTypeOf } from "expect-type";
import z from "zod";

import { createNonEmptyArraySchema, type NonEmptyArray } from "./nonEmptyArray.js";

type TestInput<InnerSchema extends z.ZodType> = {
  innerSchema: InnerSchema;
  inputValue: z.input<InnerSchema>[];
};

const testCasesForCreateNonEmptyArraySchema = [
  {
    testInput: {
      data: {
        innerSchema: z.string(),
        inputValue: ["string1", "string2"],
      },
      testCaseDescription: "non-empty string array",
    },
    testOutcome: true,
  },
  {
    testInput: {
      data: {
        innerSchema: z.string(),
        inputValue: [],
      },
      testCaseDescription: "empty string array",
    },
    testOutcome: false,
  },
] satisfies {
  testInput: {
    data: TestInput<z.ZodType>;
    testCaseDescription: string;
  };
  testOutcome: boolean;
}[];

describe("NonEmptyStringSchema", () => {
  for (const { testInput, testOutcome } of testCasesForCreateNonEmptyArraySchema) {
    it(`for ${testInput.testCaseDescription} parsing should return "${testOutcome}"`, async () => {
      const NonEmptyArraySchema = createNonEmptyArraySchema(testInput.data.innerSchema);
      const parsingResult = NonEmptyArraySchema.safeParse(testInput.data.inputValue);
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<NonEmptyArray<string>>();
      }
    });
  }
});
