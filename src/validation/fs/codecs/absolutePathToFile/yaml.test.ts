import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { YamlFileSchema, type YamlFile } from "./yaml.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForYamlFileSchema = [
  {
    testInput: join(
      __dirname,
      "../../../../../fixtures/unit-test-workspace/workflows/test-workflow.yml",
    ),
    testOutcome: true,
  },
  {
    testInput: join(
      __dirname,
      "../../../../../fixtures/unit-test-workspace/workflows/test-workflow.json",
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
  testInput: z.input<typeof YamlFileSchema>;
  testOutcome: boolean;
}[];

describe("YamlFileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForYamlFileSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = await YamlFileSchema.safeParseAsync(testInput);
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<YamlFile>();
      }
    });
  }
});
