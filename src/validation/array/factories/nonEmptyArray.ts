import z from "zod";

import { errorMessages } from "../../../constants/errorMessages.js";

export const createNonEmptyArraySchema = <T extends z.ZodType>(schema: T) => {
  return z.tuple([schema], schema, {
    error: errorMessages.validation_array_factories_createNonEmptyArraySchema_invalidInput(),
  });
};

export type NonEmptyArray<T> = [T, ...T[]];
