import z from "zod";

const EmptyLinesOptionsSchema = z.union([
  z.literal("allow"),
  z.literal("allowTrailing"),
  z.literal("fail"),
]);

export const PlainFileTermReferenceOptionsSchema = z.object({
  emptyLines: EmptyLinesOptionsSchema,
  trimWhitespace: z.boolean(),
});

export const PlainFileTermReferenceOptionsInputSchema = z
  .object({
    emptyLines: EmptyLinesOptionsSchema.prefault(() => "allowTrailing"),
    trimWhitespace: z.boolean().prefault(() => true),
  } satisfies {
    [key in keyof typeof PlainFileTermReferenceOptionsSchema.shape]: z.ZodPrefault<
      (typeof PlainFileTermReferenceOptionsSchema.shape)[key]
    >;
  })
  .prefault(() => ({}));
