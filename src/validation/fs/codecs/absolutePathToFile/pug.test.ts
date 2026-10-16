import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { PugFileSchema, type PugFile } from "./pug.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForJsonFileSchema = [
  {
    testInput: join(__dirname, "../../../../../fixtures/workspace1/templates/test-template.pug"),
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
  testInput: z.input<typeof PugFileSchema>;
  testOutcome: boolean;
}[];

describe("PugFileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForJsonFileSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = await PugFileSchema.safeParseAsync(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<PugFile>();
      }
    });
  }
});
