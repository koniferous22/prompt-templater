import { expectTypeOf } from "expect-type";

import { isNonEmptyArray, type NonEmptyArray } from "./isNonEmptyArray.js";

const exampleArray = [] as number[];

if (isNonEmptyArray(exampleArray)) {
  expectTypeOf(exampleArray).toEqualTypeOf<NonEmptyArray<number>>();
}
