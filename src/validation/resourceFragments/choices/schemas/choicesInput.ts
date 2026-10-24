import z from "zod";

import {
  WorkflowStepChoicesValueType,
  type WorkflowStepChoicesValueTypeType,
} from "../../../../constants/enums/workflowStep/choicesValueType.js";
import { wrapNonEmptyInputLiteralIntoArray } from "../../../../utils/array/wrapNonEmptyInputLiteralIntoArray.js";
import {
  buildUnionOptionsFromEnumMapper,
  zodUnionFromEnumMapper,
} from "../../../../utils/deps/zod/zodUnionFromEnumMapper.js";
import { BooleanStringSchema } from "../../../boolean/schemas/booleanString.js";
import { AbsolutePathSchema, RelativePathSchema } from "../../../path/customTypes/index.js";
import { JsonFilepathSchema, YamlFilepathSchema } from "../../../path/schemas/pathWithExtension.js";
import { NonEmptyStringToTermResourceReferenceSchema } from "../../../resourceReference/term/codecs/nonEmptyStringToResourceReference.js";
import { PlainFileTermReferenceOptionsInputSchema } from "../../../resourceReference/term/schemas/plainFileReferenceOptions.js";
import { SelectorSchema } from "../../../resourceReference/term/schemas/selector.js";
import { NonEmptyStringSchema } from "../../../string/customTypes/string.js";

const ChoicesToArrayOfLiteralsSchemaMapper = {
  [WorkflowStepChoicesValueType.Boolean]: z.preprocess(
    (value) => wrapNonEmptyInputLiteralIntoArray(value),
    z.array(z.boolean()),
  ),
  [WorkflowStepChoicesValueType.Number]: z.preprocess(
    (value) => wrapNonEmptyInputLiteralIntoArray(value),
    z.array(z.number()),
  ),
  // Note - plain string cannot be preprocessed by being converted into array, as it's used for
  [WorkflowStepChoicesValueType.String]: z.array(NonEmptyStringSchema),
} as const satisfies Record<WorkflowStepChoicesValueTypeType, z.ZodType>;

const ChoicesToRecordOfLiteralsSchemaMapper = {
  [WorkflowStepChoicesValueType.Boolean]: z.record(BooleanStringSchema, NonEmptyStringSchema),
  [WorkflowStepChoicesValueType.Number]: z.record(z.number(), NonEmptyStringSchema),
  [WorkflowStepChoicesValueType.String]: z.record(NonEmptyStringSchema, NonEmptyStringSchema),
} as const satisfies Record<WorkflowStepChoicesValueTypeType, z.ZodType>;

export const ChoicesInputSchema = z.union([
  NonEmptyStringToTermResourceReferenceSchema.transform((reference) => ({
    type: "reference" as const,
    reference,
  })),
  z.discriminatedUnion("type", [
    z
      .object({
        type: z.literal("literal"),
        values: z.union([
          ...buildUnionOptionsFromEnumMapper(ChoicesToArrayOfLiteralsSchemaMapper),
          ...buildUnionOptionsFromEnumMapper(ChoicesToRecordOfLiteralsSchemaMapper),
        ]),
      })
      .transform((literalValues) =>
        Array.isArray(literalValues.values)
          ? {
              ...literalValues,
              // Additional value, to distinguish between shape formats
              format: "array" as const,
            }
          : {
              ...literalValues,
              // Additional value, to distinguish between shape formats
              format: "record" as const,
            },
      ),
    z.object({
      type: z.literal("jsonFile"),
      file: JsonFilepathSchema,
      selector: SelectorSchema.nullable().prefault(() => null),
    }),
    z.object({
      type: z.literal("yamlFile"),
      file: YamlFilepathSchema,
      selector: SelectorSchema.nullable().prefault(() => null),
    }),
    z.object({
      type: z.literal("plainFile"),
      file: z.union([AbsolutePathSchema, RelativePathSchema]),
      options: PlainFileTermReferenceOptionsInputSchema,
    }),
  ]),
  zodUnionFromEnumMapper(ChoicesToArrayOfLiteralsSchemaMapper).transform((literalArrayValues) => ({
    type: "literal" as const,
    format: "array" as const,
    values: literalArrayValues,
  })),
  zodUnionFromEnumMapper(ChoicesToRecordOfLiteralsSchemaMapper).transform(
    (literalRecordValues) => ({
      type: "literal" as const,
      format: "record" as const,
      values: literalRecordValues,
    }),
  ),
]);
