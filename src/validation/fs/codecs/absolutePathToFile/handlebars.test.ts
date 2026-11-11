import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { HandlebarsFileSchema, type HandlebarsFile } from "./handlebars.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForHandlebarsFileSchema = [
  {
    testInput: join(
      __dirname,
      "../../../../../fixtures/unit-test-workspace/templates/test-template-basic.hbs",
    ),
    testOutcome: true,
  },
  {
    testInput: join(
      __dirname,
      "../../../../../fixtures/unit-test-workspace/workflows/test-workflow.yml",
    ),
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
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<HandlebarsFile>();
      }
    });
  }
});
