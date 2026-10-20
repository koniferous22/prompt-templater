import assert from "node:assert/strict";
import { describe, it, test } from "node:test";

import { wrapNonEmptyInputLiteralIntoArray } from "./wrapNonEmptyInputLiteralIntoArray.js";

const testCasesForWrapNonEmptyInputLiteralIntoArray = [
  {
    testInput: {
      data: 42,
      testCaseDescription: "number",
    },
    testOutcome: {
      data: {
        assertionType: "deepEqual",
        value: [42],
      },
      testBehaviourDescription: "wrap into array",
    },
  },
  {
    testInput: {
      data: "hello",
      testCaseDescription: "string",
    },
    testOutcome: {
      data: {
        assertionType: "deepEqual",
        value: ["hello"],
      },
      testBehaviourDescription: "wrap into array",
    },
  },
  {
    testInput: {
      data: true,
      testCaseDescription: "boolean",
    },
    testOutcome: {
      data: {
        assertionType: "deepEqual",
        value: [true],
      },
      testBehaviourDescription: "wrap into array",
    },
  },
  {
    testInput: {
      data: 1n,
      testCaseDescription: "bigint",
    },
    testOutcome: {
      data: {
        assertionType: "deepEqual",
        value: [1n],
      },
      testBehaviourDescription: "wrap into array",
    },
  },
  {
    testInput: {
      data: undefined,
      testCaseDescription: "undefined",
    },
    testOutcome: {
      data: {
        assertionType: "equalOriginal",
      },
      testBehaviourDescription: "leave as-is",
    },
  },
  {
    testInput: {
      data: { a: 1 },
      testCaseDescription: "object",
    },
    testOutcome: {
      data: {
        assertionType: "equalOriginal",
      },
      testBehaviourDescription: "leave as-is",
    },
  },
  {
    testInput: {
      data: [1, 2],
      testCaseDescription: "array",
    },
    testOutcome: {
      data: {
        assertionType: "equalOriginal",
      },
      testBehaviourDescription: "leave as-is",
    },
  },
  {
    testInput: {
      data: null,
      testCaseDescription: 'null (typeof null === "object")',
    },
    testOutcome: {
      data: {
        assertionType: "equalOriginal",
      },
      testBehaviourDescription: "leave as-is",
    },
  },
  {
    testInput: {
      data: () => {},
      testCaseDescription: "function",
    },
    testOutcome: {
      data: {
        assertionType: "equalOriginal",
      },
      testBehaviourDescription: "leave as-is",
    },
  },
  {
    testInput: {
      data: Symbol("x"),
      testCaseDescription: "symbol",
    },
    testOutcome: {
      data: {
        assertionType: "equalOriginal",
      },
      testBehaviourDescription: "leave as-is",
    },
  },
] satisfies {
  testInput: {
    data: any;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          assertionType: "equalOriginal";
        }
      | {
          assertionType: "deepEqual";
          value: any[];
        };
    testBehaviourDescription: string;
  };
}[];

describe("wrapNonEmptyInputLiteralIntoArray", () => {
  for (const { testInput, testOutcome } of testCasesForWrapNonEmptyInputLiteralIntoArray) {
    it(`for "${testInput.testCaseDescription}" it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = wrapNonEmptyInputLiteralIntoArray(testInput.data);
      if (testOutcome.data.assertionType === "equalOriginal") {
        assert.equal(result, testInput.data);
      } else {
        assert.deepEqual(result, testOutcome.data.value);
      }
    });
  }
});
