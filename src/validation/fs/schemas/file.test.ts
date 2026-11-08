import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { FileSchema, type File } from "./file.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForFileSchema = [
  {
    testInput: join(__dirname, "../../../../package.json"),
    testOutcome: true,
  },
  {
    testInput: join(__dirname, "../../../../fixtures"),
    testOutcome: false,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: false,
  },
  {
    testInput: join(__dirname, "../../../../non-existing-file"),
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
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<File>();
      }
    });
  }
});
