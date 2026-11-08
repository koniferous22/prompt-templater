import { describe, it } from "bun:test";
import assert from "node:assert";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { JsonFileSchema, type JsonFile } from "./json.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForJsonFileSchema = [
  {
    testInput: join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.json"),
    testOutcome: true,
  },
  {
    testInput: join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.yml"),
    testOutcome: false,
  },
  {
    testInput: join(__dirname, "../../../../../fixtures"),
    testOutcome: false,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: false,
  },
  {
    testInput: join(__dirname, "../../../../../non-existing-file"),
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof JsonFileSchema>;
  testOutcome: boolean;
}[];

describe("JsonFileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForJsonFileSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = await JsonFileSchema.safeParseAsync(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<JsonFile>();
      }
    });
  }
});
