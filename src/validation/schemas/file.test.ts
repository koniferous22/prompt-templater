import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type z from "zod";

import { FileSchema } from "./file.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForFileSchema = [
  {
    testInput: join(__dirname, "../../../package.json"),
    testOutcome: true,
  },
  {
    testInput: join(__dirname, "../../../fixtures"),
    testOutcome: false,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: false,
  },
  {
    testInput: join(__dirname, "../../../non-existing-file"),
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof FileSchema>;
  testOutcome: boolean;
}[];

describe("FileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForFileSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = await FileSchema.safeParseAsync(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});
