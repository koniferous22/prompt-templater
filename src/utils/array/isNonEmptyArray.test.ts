import { expectTypeOf } from "expect-type";

import type { NonEmptyArray } from "../../validation/array/higher-order/nonEmptyArray.js";
import { isNonEmptyArray } from "./isNonEmptyArray.js";

const exampleArray = [] as number[];

if (isNonEmptyArray(exampleArray)) {
  expectTypeOf(exampleArray).toEqualTypeOf<NonEmptyArray<number>>();
}
