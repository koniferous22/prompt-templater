import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type z from "zod";

import {
  AbsolutePathPosixSchema,
  PathFragmentPosixSchema,
  RelativePathPosixSchema,
} from "./path.js";

const testCasesForAbsolutePathPosixSchema = [
  {
    testInput: "/home/some/absolute/path",
    testOutcome: true,
  },
  {
    testInput: "C:\\windows-absolute-path",
    testOutcome: false,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof AbsolutePathPosixSchema>;
  testOutcome: boolean;
}[];

describe("AbsolutePathPosixSchema", () => {
  for (const { testInput, testOutcome } of testCasesForAbsolutePathPosixSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = AbsolutePathPosixSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});

const testCasesForRelativePathPosixSchema = [
  {
    testInput: "/home/some/absolute/path",
    testOutcome: false,
  },
  {
    testInput: "C:\\windows-absolute-path",
    testOutcome: true,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: true,
  },
] satisfies {
  testInput: z.input<typeof RelativePathPosixSchema>;
  testOutcome: boolean;
}[];

describe("RelativePathPosixSchema", () => {
  for (const { testInput, testOutcome } of testCasesForRelativePathPosixSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = RelativePathPosixSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});

const testCasesForPathFragmentPosixSchema = [
  {
    testInput: "/home/some/absolute/path",
    testOutcome: false,
  },
  {
    testInput: "C:\\windows-absolute-path",
    testOutcome: true,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: true,
  },
] satisfies {
  testInput: z.input<typeof PathFragmentPosixSchema>;
  testOutcome: boolean;
}[];

describe("PathFragmentPosixSchema", () => {
  for (const { testInput, testOutcome } of testCasesForPathFragmentPosixSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = PathFragmentPosixSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});
