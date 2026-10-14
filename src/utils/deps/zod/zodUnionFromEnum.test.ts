import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { zodUnionFromEnum } from './zodUnionFromEnum.js';

const TestEnum = {
  ValueA: 'valueA',
  ValueB: 'valueB',
} as const;
type TestEnumType = (typeof TestEnum)[keyof typeof TestEnum];

describe('zodUnionFromEnum', () => {
  it('accepts every value of the enum', () => {
    const schema = zodUnionFromEnum(TestEnum);

    for (const value of Object.values(TestEnum)) {
      assert.equal(schema.parse(value), value);
    }
  });

  it('rejects values that are not part of the enum', () => {
    const schema = zodUnionFromEnum(TestEnum);

    assert.equal(schema.safeParse('valueC').success, false);
    assert.equal(schema.safeParse('ValueA').success, false); // keys are not values
    assert.equal(schema.safeParse(undefined).success, false);
    assert.equal(schema.safeParse(null).success, false);
    assert.equal(schema.safeParse(1).success, false);
  });

  it('works when nested inside an object schema', () => {
    const schema = z.object({ kind: zodUnionFromEnum(TestEnum) });

    assert.deepEqual(schema.parse({ kind: 'valueB' }), { kind: 'valueB' });
    assert.equal(schema.safeParse({ kind: 'nope' }).success, false);
    assert.equal(schema.safeParse({}).success, false);
  });

  it('infers the union of enum values as the output type', () => {
    const schema = zodUnionFromEnum(TestEnum);

    // Compile-time check: fails type-checking if inference is wrong
    const parsed: z.infer<typeof schema> = schema.parse('valueA');
    const asEnumType: TestEnumType = parsed;

    assert.equal(asEnumType, 'valueA');
  });

  it('supports enums with a single value', () => {
    const schema = zodUnionFromEnum({ Only: 'only' } as const);

    assert.equal(schema.parse('only'), 'only');
    assert.equal(schema.safeParse('other').success, false);
  });

  it('supports numeric values and deduplicates repeated ones', () => {
    const schema = zodUnionFromEnum({ One: 1, Two: 2, AlsoTwo: 2 } as const);

    assert.equal(schema.parse(1), 1);
    assert.equal(schema.parse(2), 2);
    assert.equal(schema.safeParse(3).success, false);
    assert.equal(schema.safeParse('1').success, false);
  });

  it('rejects anything if no keys provided', () => {
    const schema = zodUnionFromEnum({} as const as any)
    assert.equal(schema.safeParse('1').success, false);
  });
});