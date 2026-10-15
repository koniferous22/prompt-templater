import z from "zod";

import {
  InquirerInputPromptValidator,
  type InquirerInputPromptValidatorType,
} from "../../../../../../constants/enums/inquirer/inputPromptValidator.js";
import { zodUnionFromEnum } from "../../../../../../utils/deps/zod/zodUnionFromEnum.js";
import { NonEmptyStringSchema } from "../../../../../string/customTypes/string.js";
import { AbstractWorkflowStepSchema } from "./abstract/abstractWorkflowStep.js";

export const inputPromptValidatorToZodSchema = {
  boolean: z.boolean(),
  number: z.number(),
  string: NonEmptyStringSchema,
} satisfies Record<InquirerInputPromptValidatorType, z.ZodType<any>>;

const InputPromptOptionalValidationErrorMessageSchema = z.object({
  typeErrorMessage: NonEmptyStringSchema.optional(),
});

const InputPromptRequiredValidationErrorMessageSchema = z.object({
  requiredErrorMessage: NonEmptyStringSchema.optional(),
  typeErrorMessage: NonEmptyStringSchema.optional(),
});

// TODO - figure out how to reorganize "shorthand" codecs
const InputPromptOptionalValidationErrorMessageShorthandSchema = z.codec(
  z.union([NonEmptyStringSchema.optional(), InputPromptOptionalValidationErrorMessageSchema]),
  InputPromptOptionalValidationErrorMessageSchema,
  {
    decode: (value) => {
      return typeof value === "string" || typeof value === "undefined"
        ? {
            typeErrorMessage: value,
          }
        : value;
    },
    encode: (value) => InputPromptOptionalValidationErrorMessageSchema.parse(value),
  },
);

const BaseOptionalWithDefaultInputPromptValidatorSchema = {
  type: z.literal("optionalWithDefault"),
};

const InputPromptValidationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("optional"),
    validator: zodUnionFromEnum(InquirerInputPromptValidator).prefault("string"),
    error: InputPromptOptionalValidationErrorMessageShorthandSchema.optional(),
  }),
  z.object({
    type: z.literal("required"),
    validator: zodUnionFromEnum(InquirerInputPromptValidator).prefault("string"),
    error: InputPromptRequiredValidationErrorMessageSchema.optional(),
  }),
  z.discriminatedUnion("validator", [
    z.object({
      ...BaseOptionalWithDefaultInputPromptValidatorSchema,
      validator: z.literal("boolean"),
      value: inputPromptValidatorToZodSchema.boolean,
      error: InputPromptOptionalValidationErrorMessageShorthandSchema.optional(),
    }),
    z.object({
      ...BaseOptionalWithDefaultInputPromptValidatorSchema,
      validator: z.literal("number"),
      value: inputPromptValidatorToZodSchema.number,
      error: InputPromptOptionalValidationErrorMessageShorthandSchema.optional(),
    }),
    z.object({
      ...BaseOptionalWithDefaultInputPromptValidatorSchema,
      // Default inferred value is string in case "validator" is not specified
      validator: z.literal("string").prefault("string"),
      value: inputPromptValidatorToZodSchema.string,
      error: InputPromptOptionalValidationErrorMessageShorthandSchema.optional(),
    }),
  ]),
]);

export const InputWorkflowStepSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("input"),
  message: NonEmptyStringSchema,
  validation: InputPromptValidationSchema,
});
