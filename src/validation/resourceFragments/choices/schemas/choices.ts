import z from "zod";

import {
  WorkflowStepChoicesValueType,
  type WorkflowStepChoicesValueTypeType,
} from "../../../../constants/enums/workflowStep/choicesValueType.js";
import { BooleanStringSchema } from "../../../boolean/schemas/booleanString.js";
import { TermResourceReferenceSchema } from "../../../resourceReference/term/schemas/termResourceReference.js";
import { NonEmptyStringSchema } from "../../../string/customTypes/string.js";

const BaseSelectPromptLiteralChoicesArrayValueTypeSchema = z.object({
  type: z.literal("literal"),
  format: z.literal("array"),
});

const BaseSelectPromptLiteralChoicesRecordValueTypeSchema = z.object({
  type: z.literal("literal"),
  format: z.literal("record"),
});

const SelectPromptLiteralChoicesArrayValueTypeMapper = {
  [WorkflowStepChoicesValueType.Boolean]:
    BaseSelectPromptLiteralChoicesArrayValueTypeSchema.safeExtend({
      valueType: z.literal(WorkflowStepChoicesValueType.Boolean),
      values: z.array(z.boolean()),
    }),
  [WorkflowStepChoicesValueType.Number]:
    BaseSelectPromptLiteralChoicesArrayValueTypeSchema.safeExtend({
      valueType: z.literal(WorkflowStepChoicesValueType.Number),
      values: z.array(z.number()),
    }),
  [WorkflowStepChoicesValueType.String]:
    BaseSelectPromptLiteralChoicesArrayValueTypeSchema.safeExtend({
      valueType: z.literal(WorkflowStepChoicesValueType.String),
      values: z.array(NonEmptyStringSchema),
    }),
} as const satisfies Record<WorkflowStepChoicesValueTypeType, z.ZodObject>;

const SelectPromptLiteralChoicesRecordValueTypeMapper = {
  [WorkflowStepChoicesValueType.Boolean]:
    BaseSelectPromptLiteralChoicesRecordValueTypeSchema.safeExtend({
      valueType: z.literal(WorkflowStepChoicesValueType.Boolean),
      values: z.record(BooleanStringSchema, NonEmptyStringSchema),
    }),
  [WorkflowStepChoicesValueType.Number]:
    BaseSelectPromptLiteralChoicesRecordValueTypeSchema.safeExtend({
      valueType: z.literal(WorkflowStepChoicesValueType.Number),
      values: z.record(z.number(), NonEmptyStringSchema),
    }),
  [WorkflowStepChoicesValueType.String]:
    BaseSelectPromptLiteralChoicesRecordValueTypeSchema.safeExtend({
      valueType: z.literal(WorkflowStepChoicesValueType.String),
      values: z.record(NonEmptyStringSchema, NonEmptyStringSchema),
    }),
} as const satisfies Record<WorkflowStepChoicesValueTypeType, z.ZodObject>;

type LiteralChoiceArrayValueMapperSchemaType =
  (typeof SelectPromptLiteralChoicesArrayValueTypeMapper)[keyof typeof SelectPromptLiteralChoicesArrayValueTypeMapper];

type LiteralChoiceRecordValueMapperSchemaType =
  (typeof SelectPromptLiteralChoicesRecordValueTypeMapper)[keyof typeof SelectPromptLiteralChoicesRecordValueTypeMapper];
export const ChoicesSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("literalValues"),
    values: z.discriminatedUnion("format", [
      z.discriminatedUnion(
        // Note "valueType" injected from upper scope
        "valueType",
        // Mapper is nonempty
        Object.values(SelectPromptLiteralChoicesArrayValueTypeMapper) as [
          LiteralChoiceArrayValueMapperSchemaType,
          ...LiteralChoiceArrayValueMapperSchemaType[],
        ],
      ),
      z.discriminatedUnion(
        // Note "valueType" injected from upper scope
        "valueType",
        // Mapper is nonempty
        Object.values(SelectPromptLiteralChoicesRecordValueTypeMapper) as [
          LiteralChoiceRecordValueMapperSchemaType,
          ...LiteralChoiceRecordValueMapperSchemaType[],
        ],
      ),
    ]),
  }),
  z.object({
    type: z.literal("reference"),
    reference: TermResourceReferenceSchema,
  }),
]);
