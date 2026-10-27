import z from "zod";

import type { WorkflowStepChoicesValueTypeType } from "../../../../../constants/enums/workflowStep/choicesValueType.js";
import { createError } from "../../../../../utils/deps/neverthrow/errorFactory.js";
import { zodIssueFromAppError } from "../../../../../utils/deps/zod/zodIssueFromAppError.js";
import { createNonEmptyArraySchema } from "../../../../array/factories/nonEmptyArray.js";
import { BooleanStringSchema } from "../../../../boolean/schemas/booleanString.js";
import {
  NonEmptyStringSchema,
  type NonEmptyString,
} from "../../../../string/customTypes/string.js";

// For sake of simplicity alias
export type TermValueType = WorkflowStepChoicesValueTypeType;

const termFromArrayInputSchemasByTermType = {
  boolean: z.array(z.boolean()),
  number: z.array(z.number()),
  string: z.array(NonEmptyStringSchema),
} satisfies Record<TermValueType, z.ZodArray<z.ZodType>>;

const termFromRecordInputSchemasByTermType = {
  boolean: z.record(BooleanStringSchema, NonEmptyStringSchema),
  number: z.record(z.number(), NonEmptyStringSchema),
  string: z.record(NonEmptyStringSchema, NonEmptyStringSchema),
} satisfies Record<TermValueType, z.ZodRecord>;

const termOutputSchemasByTermType = {
  boolean: z.boolean(),
  number: z.number(),
  string: NonEmptyStringSchema,
} satisfies Record<TermValueType, z.ZodType>;

const termOutputSchemasFromStringByTermType = {
  boolean: z.stringbool({
    truthy: ["true"],
    falsy: ["false"],
  }),
  number: z.coerce.number(),
  string: NonEmptyStringSchema,
} satisfies Record<TermValueType, z.ZodType>;

export const createTermByTermTypeSchema = <TermValue extends TermValueType>(termType: TermValue) =>
  createNonEmptyArraySchema(
    z.object({
      value: termOutputSchemasByTermType[termType],
      label: NonEmptyStringSchema,
      description: NonEmptyStringSchema.optional(),
    }),
  );

export type TermInputArrayValue<TermType extends TermValueType> = z.input<
  (typeof termFromArrayInputSchemasByTermType)[TermType]
>;

export type TermInputRecordValue<TermType extends TermValueType> = z.input<
  (typeof termFromRecordInputSchemasByTermType)[TermType]
>;

export type Term<TermType extends TermValueType> = z.output<
  ReturnType<typeof createTermByTermTypeSchema<TermType>>
>;

type TermValueFromTermType<TermType extends TermValueType> = z.output<
  (typeof termOutputSchemasByTermType)[TermType]
>;

export const createTermFromArrayInputByTermTypeCodec = <TermType extends TermValueType>(
  termType: TermType,
) =>
  z.codec<
    (typeof termFromArrayInputSchemasByTermType)[TermType],
    ReturnType<typeof createTermByTermTypeSchema<TermType>>
  >(termFromArrayInputSchemasByTermType[termType], createTermByTermTypeSchema(termType), {
    // @ts-expect-error covered by unit test
    decode: (termValues: TermValueFromTermType<TermType>[]) => {
      return termValues.map((termValue) => ({
        value: termValue,
        label: `${termValue}`,
      }));
    },
    // @ts-expect-error covered by unit test
    encode: (termValues: { value: TermValueFromTermType<TermType> }[]) => {
      return termValues.map(({ value }) => value);
    },
  });

export const createTermFromRecordInputByTermTypeCodec = <TermType extends TermValueType>(
  termType: TermType,
) =>
  z.codec<
    (typeof termFromRecordInputSchemasByTermType)[TermType],
    ReturnType<typeof createTermByTermTypeSchema<TermType>>
  >(termFromRecordInputSchemasByTermType[termType], createTermByTermTypeSchema(termType), {
    // @ts-expect-error covered by unit test
    decode: (termValues: Record<TermType, NonEmptyString>, ctx) => {
      return Object.entries(termValues).map(
        // Note - termValue - i.e. object key is always parsed as string, therefore has to be converted
        // @ts-expect-error
        ([termValue, termLabel]: [string, NonEmptyString]) => {
          const termValueParseResult =
            termOutputSchemasFromStringByTermType[termType].safeParse(termValue);
          if (!termValueParseResult.success) {
            ctx.issues.push(
              zodIssueFromAppError(
                createError(
                  "validation_resources_term_factories_termByTermType_createTermFromRecordInputByTermTypeCodec_invalidValueType",
                  {
                    stringifiedValue: termValue,
                    termType,
                  },
                ),
                termValue,
              ),
            );
          }
          return {
            // In case issue is found, then it shouldn't matter what's parsed as final value (final )
            value: termValueParseResult.success ? termValueParseResult.data : termValue,
            label: termLabel,
          };
        },
      );
    },
    // @ts-expect-error covered by unit test
    encode: (termValues: { value: TermValueFromTermType<TermType>; label: NonEmptyString }[]) => {
      return Object.fromEntries(termValues.map(({ value, label }) => [value, label]));
    },
  });
