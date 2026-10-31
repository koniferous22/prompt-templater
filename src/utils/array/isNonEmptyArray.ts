import type { NonEmptyArray } from "../../validation/array/higher-order/nonEmptyArray.js";

export const isNonEmptyArray = <T>(arr: readonly T[]): arr is NonEmptyArray<T> => {
  return arr.length > 0;
};
