import { z } from "zod";

type EnumLike = Readonly<Record<string, string | number>>;

function buildUnion<T extends EnumLike>(enumObject: T): z.ZodType<T[keyof T]> {
  const [first, second, ...rest] = [...new Set(Object.values(enumObject))].map((value) =>
    z.literal(value),
  );
  if (first === undefined) {
    return z.never() as z.ZodType<T[keyof T]>;
  }
  if (second === undefined) {
    return first as unknown as z.ZodType<T[keyof T]>;
  }
  return z.union([first, second, ...rest]) as unknown as z.ZodType<T[keyof T]>;
}

type AtLeastOneKey<T> = { [K in keyof T]: Record<K, T[K]> }[keyof T];

export const zodUnionFromEnum = <const T extends EnumLike & AtLeastOneKey<T>>(
  enumObject: T,
): z.ZodType<T[keyof T]> => {
  return buildUnion(enumObject);
};
