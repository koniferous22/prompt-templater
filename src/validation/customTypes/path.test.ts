import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AbsolutePathSchema, RelativePathSchema } from './path.js';
import type z from 'zod';

const testCasesForAbsolutePathSchema = [
  {
    testInput: '/home/some/absolute/path',
    testOutcome: true,
  },
  {
    testInput: 'not-absolute-path',
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof AbsolutePathSchema>;
  testOutcome: boolean;
}[];

describe('AbsolutePathSchema', () => {
  for (const { testInput, testOutcome } of testCasesForAbsolutePathSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = AbsolutePathSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});

const testCasesForRelativePathSchema = [
  {
    testInput: '/home/some/absolute/path',
    testOutcome: false,
  },
  {
    testInput: 'C:\\windows-absolute-path',
    testOutcome: false,
  },
  {
    testInput: 'not-absolute-path',
    testOutcome: true,
  },
] satisfies {
  testInput: z.input<typeof RelativePathSchema>;
  testOutcome: boolean;
}[];

describe('RelativePathSchema', () => {
  for (const { testInput, testOutcome } of testCasesForRelativePathSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, () => {
      const parsingResult = RelativePathSchema.safeParse(testInput);
      assert.strictEqual(parsingResult.success, testOutcome);
    });
  }
});
