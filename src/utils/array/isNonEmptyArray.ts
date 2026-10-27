import type { NonEmptyArray } from "../../validation/array/factories/nonEmptyArray.js";

export const isNonEmptyArray = <T>(arr: readonly T[]): arr is NonEmptyArray<T> => {
  return arr.length > 0;
};
