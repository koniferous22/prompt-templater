import { z } from "zod";

import type { AtLeastOneKey } from "../../../generics/generics.js";

type EnumLike = Readonly<Record<string, string | number>>;

export function buildUnionOptionsFromEnum<const T extends EnumLike & AtLeastOneKey<T>>(
  enumObject: T,
): [z.ZodType<T[keyof T]>, ...z.ZodType<T[keyof T]>[]] {
  const uniqueValues = [...new Set(Object.values(enumObject))] as T[keyof T][];

  const options = uniqueValues.map((value) =>
    z.literal(value as unknown as z.util.Literal),
  ) as unknown as z.ZodType<T[keyof T]>[];

  return options as [z.ZodType<T[keyof T]>, ...z.ZodType<T[keyof T]>[]];
}

export function zodUnionFromEnum<const T extends EnumLike & AtLeastOneKey<T>>(
  enumObject: T,
): z.ZodType<T[keyof T]> {
  const options = buildUnionOptionsFromEnum(enumObject);
  const [first, second, ...rest] = options;

  if (first === undefined) {
    return z.never() as z.ZodType<T[keyof T]>;
  }
  if (second === undefined) {
    return first;
  }

  return z.union([first, second, ...rest] as [z.ZodType, z.ZodType, ...z.ZodType[]]) as z.ZodType<
    T[keyof T]
  >;
}
