import { Ok, ok } from "neverthrow";
import z from "zod";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import {
  BooleanTermFromBooleanArraySchema,
  BooleanTermFromBooleanRecordSchema,
  NumericTermFromNumericArraySchema,
  NumericTermFromNumericRecordSchema,
  StringTermFromStringArraySchema,
  StringTermFromStringRecordSchema,
} from "../../../../validation/resources/term/term/codecs/term.js";
import type {
  TermData,
  TermValueType,
} from "../../../../validation/resources/term/term/factories/termByTermType.js";
import { termToInquirerOptions } from "../methods/term/toInquirerOptions.js";

export const termSchemasByTermType = {
  boolean: z.union([BooleanTermFromBooleanArraySchema, BooleanTermFromBooleanRecordSchema]),
  number: z.union([NumericTermFromNumericArraySchema, NumericTermFromNumericRecordSchema]),
  string: z.union([StringTermFromStringArraySchema, StringTermFromStringRecordSchema]),
} satisfies Record<TermValueType, z.ZodUnion>;

const createTerm = <TermType extends TermValueType>(
  termType: TermType,
  inputData: z.input<(typeof termSchemasByTermType)[TermType]>,
  context: { file: AbsolutePath },
) => {
  const termSchema = termSchemasByTermType[termType];
  const termResult = termSchema.safeParse(inputData);
  if (!termResult.success) {
    return appErr("module_resources_term_factories_createTerm_invalidInputData", {
      file: context.file,
      zodError: termResult.error,
    });
  }
  const state = termResult.data as TermData<TermType>;
  const term = {
    getState: () => state,
    toInquirerOptions: () => termToInquirerOptions(state),
  };
  return ok(term);
};

export const termResourceFactories = {
  term: createTerm,
};

export type TermResourceTypes = {
  [key in keyof typeof termResourceFactories]: Extract<
    ReturnType<(typeof termResourceFactories)[key]>,
    Ok<any, any>
  > extends Ok<infer Wrapped, any>
    ? Wrapped
    : never;
};
