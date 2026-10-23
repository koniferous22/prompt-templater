import z from "zod";

export const BooleanStringSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.toLowerCase() : value),
  z.union([z.literal("true"), z.literal("false")]),
);
