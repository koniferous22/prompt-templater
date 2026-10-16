import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { YamlFileSchema, type YamlFile } from "./yaml.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForFileSchema = [
  {
    testInput: join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.yml"),
    testOutcome: true,
  },
  {
    testInput: join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.json"),
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
  testInput: z.input<typeof YamlFileSchema>;
  testOutcome: boolean;
}[];

describe("YamlFileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForFileSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = await YamlFileSchema.safeParseAsync(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<YamlFile>();
      }
    });
  }
});
