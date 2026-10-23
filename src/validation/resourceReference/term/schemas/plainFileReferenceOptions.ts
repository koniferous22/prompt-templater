import z from "zod";

export const PlainFileTermReferenceOptionsSchema = z.object({
  failOnEmptyLines: z.boolean(),
  trimWhitespace: z.boolean(),
});

export const PlainFileTermReferenceOptionsInputSchema =
  PlainFileTermReferenceOptionsSchema.prefault(() => ({
    failOnEmptyLines: true,
    trimWhitespace: true,
  }));
