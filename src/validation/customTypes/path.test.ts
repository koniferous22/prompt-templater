import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AbsolutePathSchema } from './path.js';
import type z from 'zod';

const AbsolutePathSchemaCases = [
  {
    input: '/home/some/absolute/path',
    success: true,
  },
  {
    input: 'not-absolute-path',
    success: false,
  },
] satisfies { input: z.input<typeof AbsolutePathSchema>; success: boolean }[];

describe('AbsolutePathSchema', () => {
  for (const { input, success } of AbsolutePathSchemaCases) {
    it(`"${input}" parsing should return "${success}"`, () => {
      const parsingResult = AbsolutePathSchema.safeParse(input);
      assert.strictEqual(parsingResult.success, success);
    });
  }
});
