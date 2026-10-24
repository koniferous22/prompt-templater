import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { SelectorSchema } from "./selector.js";

const testCasesForSelectorSchema = [
  {
    testInput: {
      data: [],
      testCaseDescription: "empty array",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: ["foo"],
      testCaseDescription: "single non-empty string",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: [0],
      testCaseDescription: "single non-negative integer (zero)",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: [42],
      testCaseDescription: "single non-negative integer (positive)",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: ["a", "b", "c"],
      testCaseDescription: "array of non-empty strings",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: [0, 1, 2, 100],
      testCaseDescription: "array of non-negative integers",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: ["key", 0, "nested", 3],
      testCaseDescription: "mixed non-empty strings and non-negative integers",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof SelectorSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("SelectorSchema", () => {
  for (const { testInput, testOutcome } of testCasesForSelectorSchema) {
    it(`for "${testInput.testCaseDescription}" parsing should "${testOutcome.testBehaviourDescription}"`, async () => {
      const parsingResult = SelectorSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
