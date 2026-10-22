import z from "zod";

import {
  WorkflowStepChoicesValueType,
  type WorkflowStepChoicesValueTypeType,
} from "../../../../constants/enums/workflowStep/choicesValueType.js";
import { wrapNonEmptyInputLiteralIntoArray } from "../../../../utils/array/wrapNonEmptyInputLiteralIntoArray.js";
import { TermResourceReferenceSchema } from "../../../resourceReference/term/schemas/termResourceReference.js";
import { NonEmptyStringSchema } from "../../../string/customTypes/string.js";

const BaseSelectPromptLiteralChoicesValueTypeSchema = z.object({
  type: z.literal("plainFile"),
});

const SelectPromptLiteralChoicesValueTypeMapper = {
  [WorkflowStepChoicesValueType.Boolean]: BaseSelectPromptLiteralChoicesValueTypeSchema.safeExtend({
    valueType: z.literal(WorkflowStepChoicesValueType.Boolean),
    values: z.preprocess((value) => {
      return wrapNonEmptyInputLiteralIntoArray(value);
    }, z.array(z.boolean())),
  }),
  [WorkflowStepChoicesValueType.Number]: BaseSelectPromptLiteralChoicesValueTypeSchema.safeExtend({
    valueType: z.literal(WorkflowStepChoicesValueType.Number),
    values: z.preprocess((value) => {
      return wrapNonEmptyInputLiteralIntoArray(value);
    }, z.array(z.number())),
  }),
  [WorkflowStepChoicesValueType.String]: BaseSelectPromptLiteralChoicesValueTypeSchema.safeExtend({
    valueType: z.literal(WorkflowStepChoicesValueType.String),
    values: z.preprocess((value) => {
      return wrapNonEmptyInputLiteralIntoArray(value);
    }, z.array(NonEmptyStringSchema)),
  }),
} as const satisfies Record<WorkflowStepChoicesValueTypeType, z.ZodObject>;

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
