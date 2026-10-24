import z from "zod";

export const PlainFileTermReferenceOptionsSchema = z.object({
  failOnEmptyLines: z.boolean(),
  failOnEmptyLastLine: z.boolean(),
  trimWhitespace: z.boolean(),
});

export const PlainFileTermReferenceOptionsInputSchema = z
  .object({
    failOnEmptyLines: z.boolean().prefault(() => true),
    failOnEmptyLastLine: z.boolean().prefault(() => false),
    trimWhitespace: z.boolean().prefault(() => true),
  } satisfies {
    [key in keyof typeof PlainFileTermReferenceOptionsSchema.shape]: z.ZodPrefault<
      (typeof PlainFileTermReferenceOptionsSchema.shape)[key]
    >;
  })
  .prefault(() => ({}));
