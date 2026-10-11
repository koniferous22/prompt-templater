export type NonEmptyArray<T> = [T, ...T[]];

export const isNonEmptyArray = <T>(arr: readonly T[]): arr is NonEmptyArray<T> => {
  return arr.length > 0;
};
