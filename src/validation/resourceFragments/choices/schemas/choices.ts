import z from "zod";

import {
  InquirerSelectPromptValueType,
  type InquirerSelectPromptValueTypeType,
} from "../../../../constants/enums/inquirer/selectPromptValueType.js";
import { wrapNonEmptyInputLiteralIntoArray } from "../../../../utils/array/wrapNonEmptyInputLiteralIntoArray.js";
import { TermResourceReferenceSchema } from "../../../resourceReference/term/schemas/termResourceReference.js";
import { NonEmptyStringSchema } from "../../../string/customTypes/string.js";

const BaseSelectPromptLiteralChoicesValueTypeSchema = z.object({
  type: z.literal("plainFile"),
});

const SelectPromptLiteralChoicesValueTypeMapper = {
  [InquirerSelectPromptValueType.Boolean]: BaseSelectPromptLiteralChoicesValueTypeSchema.safeExtend(
    {
      valueType: z.literal(InquirerSelectPromptValueType.Boolean),
      values: z.preprocess((value) => {
        return wrapNonEmptyInputLiteralIntoArray(value);
      }, z.array(z.boolean())),
    },
  ),
  [InquirerSelectPromptValueType.Number]: BaseSelectPromptLiteralChoicesValueTypeSchema.safeExtend({
    valueType: z.literal(InquirerSelectPromptValueType.Number),
    values: z.preprocess((value) => {
      return wrapNonEmptyInputLiteralIntoArray(value);
    }, z.array(z.number())),
  }),
  [InquirerSelectPromptValueType.String]: BaseSelectPromptLiteralChoicesValueTypeSchema.safeExtend({
    valueType: z.literal(InquirerSelectPromptValueType.String),
    values: z.preprocess((value) => {
      return wrapNonEmptyInputLiteralIntoArray(value);
    }, z.array(NonEmptyStringSchema)),
  }),
} as const satisfies Record<InquirerSelectPromptValueTypeType, z.ZodObject>;

type LiteralChoiceValueMapperSchemaType =
  (typeof SelectPromptLiteralChoicesValueTypeMapper)[keyof typeof SelectPromptLiteralChoicesValueTypeMapper];

export const ChoicesSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("literalValues"),
    // Note "valueType" injected from upper scope
    values: z.discriminatedUnion(
      "valueType",
      // Mapper is nonempty
      Object.values(SelectPromptLiteralChoicesValueTypeMapper) as [
        LiteralChoiceValueMapperSchemaType,
        ...LiteralChoiceValueMapperSchemaType[],
      ],
    ),
  }),
  z.object({
    type: z.literal("reference"),
    reference: TermResourceReferenceSchema,
  }),
]);
