import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type z from "zod";

import { FileExtensionSchema } from "./fileExtension.js";

const testCasesForFileExtensionSchema = [
  {
    testInput: "txt",
    testOutcome: true,
  },
  {
    testInput: "tar",
    testOutcome: true,
  },
  {
    testInput: ".txt",
    testOutcome: false,
  },
  {
    testInput: ".gitignore",
    testOutcome: false,
  },
  {
    testInput: "archive.tar.gz",
    testOutcome: false,
  },
  {
    testInput: "",
    testOutcome: false,
  },
  {
    testInput: "file.txt",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof FileExtensionSchema>;
  testOutcome: boolean;
}[];

describe("FileExtensionSchema", () => {
  for (const { testInput, testOutcome } of testCasesForFileExtensionSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = FileExtensionSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});
