import { err, ok } from "neverthrow";
import type { input, ZodType } from "zod";

export const createResultFromZodParseResult = <
  ZodSchema extends ZodType<any, any>,
  ZodSchemaInput extends input<ZodSchema>,
>(schema: ZodSchema) => (input: ZodSchemaInput) => {
  const parsingResult = schema.safeParse(input);
  if (parsingResult.success === true) {
    return ok(parsingResult.data);
  }
  return err(parsingResult.error);
};

