import assert from "node:assert";
import { describe, it } from "node:test";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import {
  SelectorSchema,
  type Selector,
} from "../../../../validation/resourceReference/term/schemas/selector.js";
import { retrieveTermDataBySelector } from "./retrieveDataBySelector.js";

const testCasesForRetrieveTermDataBySelector = [
  {
    testInput: {
      data: {
        inputData: { a: { b: [10, 20, 30] } },
        selector: SelectorSchema.parse(["a", "b", 1]),
      },
      testCaseDescription: "valid nested object then array path",
    },
    testOutcome: {
      testBehaviourDescription: "should return the value at the deep path",
      data: {
        result: true,
        value: 20,
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { foo: { bar: "baz" } },
        selector: SelectorSchema.parse(["foo", "bar"]),
      },
      testCaseDescription: "valid nested object path of only strings",
    },
    testOutcome: {
      testBehaviourDescription: "should return the leaf string value",
      data: {
        result: true,
        value: "baz",
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: [[{ x: 1 }], [{ x: 2 }]],
        selector: SelectorSchema.parse([1, 0, "x"]),
      },
      testCaseDescription: "valid nested array then object path",
    },
    testOutcome: {
      testBehaviourDescription: "should return the value at the deep path",
      data: {
        result: true,
        value: 2,
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { a: 1 },
        selector: [] as Selector,
      },
      testCaseDescription: "empty selector",
    },
    testOutcome: {
      testBehaviourDescription: "should return the original data unchanged",
      data: {
        result: true,
        value: { a: 1 },
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { a: { b: 5 } },
        selector: SelectorSchema.parse(["a", "missing"]),
      },
      testCaseDescription: "object key that does not exist",
    },
    testOutcome: {
      testBehaviourDescription: "should fail with correct error code",
      data: {
        result: false,
        errorCode: "module_resources_term_utils_retrieveTermDataBySelector_keyNotFoundInObject",
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { a: [10, 20] },
        selector: SelectorSchema.parse(["a", 5]),
      },
      testCaseDescription: "array index beyond length",
    },
    testOutcome: {
      testBehaviourDescription: "should fail with correct error code",
      data: {
        result: false,
        errorCode: "module_resources_term_utils_retrieveTermDataBySelector_arrayIndexOutOfRange",
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { a: 42 },
        selector: SelectorSchema.parse(["a", "b"]),
      },
      testCaseDescription: "attempt property access on non-object (number)",
    },
    testOutcome: {
      testBehaviourDescription: "should fail with correct error code",
      data: {
        result: false,
        errorCode: "module_resources_term_utils_retrieveTermDataBySelector_invalidPath",
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { a: null },
        selector: SelectorSchema.parse(["a", "b"]),
      },
      testCaseDescription: "attempt property access on null",
    },
    testOutcome: {
      testBehaviourDescription: "return null",
      data: {
        result: false,
        errorCode: "module_resources_term_utils_retrieveTermDataBySelector_invalidPath",
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { a: [1, 2, 3] },
        selector: SelectorSchema.parse(["a", "0"]),
      },
      testCaseDescription: "string selector segment used against an array",
    },
    testOutcome: {
      testBehaviourDescription: "should fail with correct error code",
      data: {
        result: false,
        errorCode: "module_resources_term_utils_retrieveTermDataBySelector_invalidPath",
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { a: { b: 1 } },
        selector: SelectorSchema.parse(["a", 0]),
      },
      testCaseDescription: "integer selector segment used against a plain object",
    },
    testOutcome: {
      testBehaviourDescription: "should fail with correct error code",
      data: {
        result: false,
        errorCode: "module_resources_term_utils_retrieveTermDataBySelector_invalidPath",
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: [[[7]]],
        selector: SelectorSchema.parse([0, 0, 0]),
      },
      testCaseDescription: "deeply nested arrays only",
    },
    testOutcome: {
      testBehaviourDescription: "should return the innermost value",
      data: {
        result: true,
        value: 7,
      },
    },
  },
  {
    testInput: {
      data: {
        inputData: { "0": { "1": "found" } },
        selector: SelectorSchema.parse(["0", "1"]),
      },
      testCaseDescription: "object keys that look like numbers but are strings",
    },
    testOutcome: {
      testBehaviourDescription: "should return the value via string keys",
      data: {
        result: true,
        value: "found",
      },
    },
  },
] satisfies {
  testInput: {
    data: {
      inputData: any;
      selector: Selector;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data:
      | {
          result: true;
          value: any;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
  };
}[];

describe("retrieveTermDataBySelector", () => {
  for (const { testInput, testOutcome } of testCasesForRetrieveTermDataBySelector) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const result = retrieveTermDataBySelector(testInput.data.inputData, testInput.data.selector, {
        file: AbsolutePathSchema.parse("/example/absolute/path"),
      });
      if (testOutcome.data.result === true) {
        assert.ok(result.isOk());
        assert.deepEqual(result.value, testOutcome.data.value);
      } else {
        assert.ok(result.isErr());
        assert.strictEqual(result.error.code, testOutcome.data.errorCode);
      }
    });
  }
});
