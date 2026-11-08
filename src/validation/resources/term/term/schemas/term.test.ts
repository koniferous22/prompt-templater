import { describe, it } from "bun:test";
import assert from "node:assert";

import { expectTypeOf } from "expect-type";
import z from "zod";

import type { TermData } from "../factories/termByTermType.js";
import { BooleanTermSchema, NumericTermSchema, StringTermSchema } from "./term.js";

const testCasesForBooleanTermSchema = [
  {
    testInput: {
      data: [
        {
          value: true,
          label: "label for true",
        },
        {
          value: false,
          label: "label for false",
        },
      ],
      testCaseDescription: "valid boolean array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: [] as any,
      testCaseDescription: "empty array",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof BooleanTermSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("BooleanTermSchema", () => {
  for (const { testInput, testOutcome } of testCasesForBooleanTermSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = BooleanTermSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"boolean">>();
      }
    });
  }
});

const testCasesForNumericTermSchema = [
  {
    testInput: {
      data: [
        {
          value: 3,
          label: "label for 3",
        },
        {
          value: 5,
          label: "label for 5",
        },
      ],
      testCaseDescription: "valid boolean array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: [] as any,
      testCaseDescription: "empty array",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof NumericTermSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("NumericTermSchema", () => {
  for (const { testInput, testOutcome } of testCasesForNumericTermSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = NumericTermSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"number">>();
      }
    });
  }
});

const testCasesForStringTermSchema = [
  {
    testInput: {
      data: [
        {
          value: "string1",
          label: "label for string1",
        },
        {
          value: "string2",
          label: "label for string2",
        },
      ],
      testCaseDescription: "valid boolean array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: [] as any,
      testCaseDescription: "empty array",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof StringTermSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("StringTermSchema", () => {
  for (const { testInput, testOutcome } of testCasesForStringTermSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = StringTermSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"string">>();
      }
    });
  }
});
