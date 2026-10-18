import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  AbsolutePathWin32Schema,
  PathFragmentWin32Schema,
  RelativePathWin32Schema,
  type AbsolutePathWin32,
  type PathFragmentWin32,
  type RelativePathWin32,
} from "./path.js";

const testCasesForAbsolutePathWin32Schema = [
  {
    testInput: "C:\\",
    testOutcome: true,
  },
  {
    testInput: "C:/",
    testOutcome: true,
  },
  {
    testInput: "c:\\Users\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "C:/Users/file.txt",
    testOutcome: true,
  },
  {
    testInput: "C://",
    testOutcome: true,
  },
  {
    testInput: "\\",
    testOutcome: true,
  },
  {
    testInput: "/",
    testOutcome: true,
  },
  {
    testInput: "\\Users\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "/Users/file.txt",
    testOutcome: true,
  },
  {
    testInput: "\\\\server",
    testOutcome: true,
  },
  {
    testInput: "\\\\server\\share",
    testOutcome: true,
  },
  {
    testInput: "\\\\server\\share\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "//server",
    testOutcome: true,
  },
  {
    testInput: "//server/share",
    testOutcome: true,
  },
  {
    testInput: "\\\\?\\C:\\Users\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "\\\\.\\C:\\Users\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "\\\\?\\UNC\\server\\share",
    testOutcome: true,
  },
  {
    testInput: "",
    testOutcome: false,
  },
  {
    testInput: "C:",
    testOutcome: false,
  },
  {
    testInput: "c:",
    testOutcome: false,
  },
  {
    testInput: "C:file.txt",
    testOutcome: false,
  },
  {
    testInput: "C:Users\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "C:Users/file.txt",
    testOutcome: false,
  },
  {
    testInput: "file.txt",
    testOutcome: false,
  },
  {
    testInput: "Users\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "Users/file.txt",
    testOutcome: false,
  },
  {
    testInput: ".\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "./file.txt",
    testOutcome: false,
  },
  {
    testInput: "..\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "../file.txt",
    testOutcome: false,
  },
  {
    testInput: "c",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof AbsolutePathWin32Schema>;
  testOutcome: boolean;
}[];

describe("AbsolutePathWin32Schema", () => {
  for (const { testInput, testOutcome } of testCasesForAbsolutePathWin32Schema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = AbsolutePathWin32Schema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<AbsolutePathWin32>();
      }
    });
  }
});

const testCasesForRelativePathWin32Schema = [
  {
    testInput: "file.txt",
    testOutcome: true,
  },
  {
    testInput: "Users\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "Users/file.txt",
    testOutcome: true,
  },
  {
    testInput: ".\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "./file.txt",
    testOutcome: true,
  },
  {
    testInput: "..\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "../file.txt",
    testOutcome: true,
  },
  {
    testInput: "C:file.txt",
    testOutcome: true,
  },
  {
    testInput: "C:Users\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "C:Users/file.txt",
    testOutcome: true,
  },
  {
    testInput: "C:",
    testOutcome: true,
  },
  {
    testInput: "..",
    testOutcome: true,
  },
  {
    testInput: ".",
    testOutcome: true,
  },
  {
    testInput: "dir\\..\\file.txt",
    testOutcome: true,
  },
  {
    testInput: "C:\\",
    testOutcome: false,
  },
  {
    testInput: "C:/Users/file.txt",
    testOutcome: false,
  },
  {
    testInput: "\\Users\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "/Users/file.txt",
    testOutcome: false,
  },
  {
    testInput: "\\\\server\\share",
    testOutcome: false,
  },
  {
    testInput: "//server/share",
    testOutcome: false,
  },
  {
    testInput: "\\\\?\\C:\\Users\\file.txt",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof RelativePathWin32Schema>;
  testOutcome: boolean;
}[];

describe("RelativePathWin32Schema", () => {
  for (const { testInput, testOutcome } of testCasesForRelativePathWin32Schema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = RelativePathWin32Schema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<RelativePathWin32>();
      }
    });
  }
});

const testCasesForPathFragmentWin32Schema = [
  {
    testInput: "file.txt",
    testOutcome: true,
  },
  {
    testInput: "Users",
    testOutcome: true,
  },
  {
    testInput: "Users\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "Users/file.txt",
    testOutcome: false,
  },
  {
    testInput: ".git",
    testOutcome: true,
  },
  {
    testInput: "..",
    testOutcome: true,
  },
  {
    testInput: ".",
    testOutcome: true,
  },
  {
    testInput: "dir\\subdir",
    testOutcome: false,
  },
  {
    testInput: "file with spaces.txt",
    testOutcome: true,
  },
  {
    testInput: "file.txt\\",
    testOutcome: false,
  },
  {
    testInput: "C:\\Users\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "C:/Users/file.txt",
    testOutcome: false,
  },
  {
    testInput: "\\\\server\\share\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "//server/share/file.txt",
    testOutcome: false,
  },
  {
    testInput: "\\\\?\\C:\\Users\\file.txt",
    testOutcome: false,
  },
  {
    testInput: "",
    testOutcome: false,
  },
  {
    testInput: "C:",
    testOutcome: false,
  },
  {
    testInput: "C:file.txt",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof PathFragmentWin32Schema>;
  testOutcome: boolean;
}[];

describe("PathFragmentWin32Schema", () => {
  for (const { testInput, testOutcome } of testCasesForPathFragmentWin32Schema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = PathFragmentWin32Schema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<PathFragmentWin32>();
      }
    });
  }
});
