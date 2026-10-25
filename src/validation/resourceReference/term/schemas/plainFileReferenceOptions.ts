import z from "zod";

const EmptyLinesOptionsSchema = z.union([
  z.literal("allow"),
  z.literal("skip"),
  z.literal("skipTrailing"),
  z.literal("fail"),
]);

export const PlainFileTermReferenceOptionsSchema = z.object({
  whitespaceLines: EmptyLinesOptionsSchema,
  trimWhitespace: z.boolean(),
  // Option denoting parsing should fail on first error
  strict: z.boolean(),
});

export const PlainFileTermReferenceOptionsInputSchema = z
  .object({
    whitespaceLines: EmptyLinesOptionsSchema.prefault(() => "skipTrailing"),
    trimWhitespace: z.boolean().prefault(() => true),
    strict: z.boolean().prefault(() => false),
  } satisfies {
    [key in keyof typeof PlainFileTermReferenceOptionsSchema.shape]: z.ZodPrefault<
      (typeof PlainFileTermReferenceOptionsSchema.shape)[key]
    >;
  })
  .prefault(() => ({}));
