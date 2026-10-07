import assert from "node:assert";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type z from "zod";

import { FolderSchema } from "./folder.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FolderSchemaCases = [
  {
    input: join(__dirname, '../../../fixtures'),
    success: true,
  },
  {
    input: join(__dirname, '../../../package.json'),
    success: false,
  },
  {
    input: 'not-absolute-path',
    success: false,
  },
  {
    input: join(__dirname, '../../../non-existing-file'),
    success: false,
  },
] satisfies { input: z.input<typeof FolderSchema>; success: boolean }[];

describe('FolderSchema', () => {
  for (const { input, success } of FolderSchemaCases) {
    it(`"${input}" parsing should return "${success}"`, async () => {
      const parsingResult = await FolderSchema.safeParseAsync(input);
      assert.strictEqual(parsingResult.success, success);
    });
  }
});
