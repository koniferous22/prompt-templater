import { z } from "zod";

import type { AtLeastOneKey } from "../../../generics/generics.js";

type EnumMapperLike = Readonly<Record<string | number, z.ZodType>>;

export function buildUnionOptionsFromEnumMapper<const T extends EnumMapperLike & AtLeastOneKey<T>>(
  mapper: T,
): [T[keyof T], ...T[keyof T][]] {
  const options = Object.values(mapper) as T[keyof T][];
  // AtLeastOneKey guarantees length >= 1
  return options as [T[keyof T], ...T[keyof T][]];
}

export function zodUnionFromEnumMapper<const T extends EnumMapperLike & AtLeastOneKey<T>>(
  mapper: T,
): z.ZodType<z.output<T[keyof T]>> {
  const [first, second, ...rest] = buildUnionOptionsFromEnumMapper(mapper);

  if (first === undefined) {
    // unreachable under the AtLeastOneKey constraint, kept for symmetry
    return z.never() as z.ZodType<z.output<T[keyof T]>>;
  }
  if (second === undefined) {
    return first as z.ZodType<z.output<T[keyof T]>>;
  }
  return z.union([first, second, ...rest] as [z.ZodType, z.ZodType, ...z.ZodType[]]) as z.ZodType<
    z.output<T[keyof T]>
  >;
}
