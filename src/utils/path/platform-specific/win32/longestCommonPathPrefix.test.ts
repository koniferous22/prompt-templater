import { describe, it } from "bun:test";
import assert from "node:assert/strict";

import {
  AbsolutePathWin32Schema,
  type AbsolutePathWin32,
} from "../../../../validation/path/customTypes/platformSpecific/win32/path.js";
import { longestCommonPathPrefixWin32 } from "./longestCommonPathPrefix.js";

const testCasesForLongestCommonPathWin32 = [
  {
    testInput: {
      data: [
        AbsolutePathWin32Schema.parse("C:\\Users\\Alice\\Docs\\file.txt"),
        AbsolutePathWin32Schema.parse("C:\\Users\\Alice\\Photos\\img.png"),
      ],
      testCaseDescription: "paths with shared ancestor",
    },
    testOutcome: {
      testBehaviourDescription: "return common ancestor",
      data: AbsolutePathWin32Schema.parse("C:\\Users\\Alice"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathWin32Schema.parse("C:\\Users\\Alice\\Docs"),
        AbsolutePathWin32Schema.parse("c:\\users\\alice\\photos"),
      ],
      testCaseDescription: "paths with shared ancestor and mixed case-sensitivity",
    },
    testOutcome: {
      testBehaviourDescription: "return common ancestor",
      data: AbsolutePathWin32Schema.parse("C:\\Users\\Alice"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathWin32Schema.parse("C:/Users/Alice/Docs"),
        AbsolutePathWin32Schema.parse("C:\\Users\\Alice\\Photos"),
      ],
      testCaseDescription: "paths with shared ancestor and mixed separators",
    },
    testOutcome: {
      testBehaviourDescription: "return common ancestor",
      data: AbsolutePathWin32Schema.parse("C:\\Users\\Alice"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathWin32Schema.parse("C:\\Windows"),
        AbsolutePathWin32Schema.parse("C:\\Users"),
      ],
      testCaseDescription: "paths that only share drive",
    },
    testOutcome: {
      testBehaviourDescription: "return drive root",
      data: AbsolutePathWin32Schema.parse("C:\\"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathWin32Schema.parse("C:\\Users\\Alice"),
        AbsolutePathWin32Schema.parse("D:\\Users\\Alice"),
      ],
      testCaseDescription: "paths with differing drivers",
    },
    testOutcome: {
      testBehaviourDescription: "return empty string",
      data: null,
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathWin32Schema.parse("C:\\Users\\Alice"),
        AbsolutePathWin32Schema.parse("C:\\Users\\Alice\\Docs\\file.txt"),
      ],
      testCaseDescription: "paths with one being ancestor of the other",
    },
    testOutcome: {
      testBehaviourDescription: "return ancestor path",
      data: AbsolutePathWin32Schema.parse("C:\\Users\\Alice"),
    },
  },
] satisfies {
  testInput: {
    data: [AbsolutePathWin32, AbsolutePathWin32];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: AbsolutePathWin32 | null;
  };
}[];

describe("longestCommonPathPrefixWin32", () => {
  for (const { testInput, testOutcome } of testCasesForLongestCommonPathWin32) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const [firstPath, secondPath] = testInput.data;
      assert.equal(longestCommonPathPrefixWin32(firstPath, secondPath), testOutcome.data);
    });
  }
});
