import { describe, it } from "bun:test";
import assert from "node:assert";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { HandlebarsFileSchema, type HandlebarsFile } from "./handlebars.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForHandlebarsFileSchema = [
  {
    testInput: join(__dirname, "../../../../../fixtures/workspace1/templates/test-template.hbs"),
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
  testInput: z.input<typeof HandlebarsFileSchema>;
  testOutcome: boolean;
}[];

describe("HandlebarsFileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForHandlebarsFileSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = await HandlebarsFileSchema.safeParseAsync(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<HandlebarsFile>();
      }
    });
  }
});
