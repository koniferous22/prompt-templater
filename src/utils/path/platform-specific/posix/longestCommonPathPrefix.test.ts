import assert from "node:assert";
import { describe, it } from "node:test";

import {
  AbsolutePathPosixSchema,
  type AbsolutePathPosix,
} from "../../../../validation/path/customTypes/platformSpecific/posix/path.js";
import { longestCommonPathPrefixPosix } from "./longestCommonPathPrefix.js";

const testCasesForLongestCommonPathPosix = [
  {
    testInput: {
      data: [
        AbsolutePathPosixSchema.parse("/home/user/docs/file.txt"),
        AbsolutePathPosixSchema.parse("/home/user/photos/img.png"),
      ],
      testCaseDescription: "paths with shared ancestor",
    },
    testOutcome: {
      testBehaviourDescription: "return common ancestor",
      data: AbsolutePathPosixSchema.parse("/home/user"),
    },
  },
  {
    testInput: {
      data: [AbsolutePathPosixSchema.parse("/var/log"), AbsolutePathPosixSchema.parse("/usr/bin")],
      testCaseDescription: "paths with only shared root",
    },
    testOutcome: {
      testBehaviourDescription: "return root",
      data: AbsolutePathPosixSchema.parse("/"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathPosixSchema.parse("/home/user/"),
        AbsolutePathPosixSchema.parse("/home/user/docs/"),
      ],
      testCaseDescription: "paths with trailing separators",
    },
    testOutcome: {
      testBehaviourDescription: "return root",
      data: AbsolutePathPosixSchema.parse("/home/user"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathPosixSchema.parse("/home/user/docs"),
        AbsolutePathPosixSchema.parse("/home/user/docs"),
      ],
      testCaseDescription: "identical paths",
    },
    testOutcome: {
      testBehaviourDescription: "return path itself",
      data: AbsolutePathPosixSchema.parse("/home/user/docs"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathPosixSchema.parse("/home/username"),
        AbsolutePathPosixSchema.parse("/home/user"),
      ],
      testCaseDescription: "paths located in same folder starting with same prefix",
    },
    testOutcome: {
      testBehaviourDescription: "return physical parent rather than longest prefix",
      data: AbsolutePathPosixSchema.parse("/home"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathPosixSchema.parse("/home/user/docs/file.txt"),
        AbsolutePathPosixSchema.parse("/home/user"),
      ],
      testCaseDescription: "paths with one being ancestor of the other",
    },
    testOutcome: {
      testBehaviourDescription: "return ancestor path",
      data: AbsolutePathPosixSchema.parse("/home/user"),
    },
  },
  {
    testInput: {
      data: [
        AbsolutePathPosixSchema.parse("/home/user"),
        AbsolutePathPosixSchema.parse("/home/user/docs/file.txt"),
      ],
      testCaseDescription: "paths with one being ancestor of the other (swapped arguments)",
    },
    testOutcome: {
      testBehaviourDescription: "return ancestor path",
      data: AbsolutePathPosixSchema.parse("/home/user"),
    },
  },
] satisfies {
  testInput: {
    data: [AbsolutePathPosix, AbsolutePathPosix];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: AbsolutePathPosix;
  };
}[];

describe("longestCommonPathPrefixPosix", () => {
  for (const { testInput, testOutcome } of testCasesForLongestCommonPathPosix) {
    it(`for ${testInput.testCaseDescription} it should "${testOutcome.testBehaviourDescription}"`, async () => {
      const [firstPath, secondPath] = testInput.data;
      assert.equal(longestCommonPathPrefixPosix(firstPath, secondPath), testOutcome.data);
    });
  }
});
