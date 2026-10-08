import assert from "node:assert";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type z from "zod";

import { FolderSchema } from "./folder.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FolderSchemaCases = [
  {
    testInput: join(__dirname, '../../../fixtures'),
    testOutcome: true,
  },
  {
    testInput: join(__dirname, '../../../package.json'),
    testOutcome: false,
  },
  {
    testInput: 'not-absolute-path',
    testOutcome: false,
  },
  {
    testInput: join(__dirname, '../../../non-existing-file'),
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof FolderSchema>;
  testOutcome: boolean;
}[];

describe('FolderSchema', () => {
  for (const { testInput, testOutcome } of FolderSchemaCases) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = await FolderSchema.safeParseAsync(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});
