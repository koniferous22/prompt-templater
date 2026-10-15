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

const BaseOptionalWithDefaultInputPromptValidatorSchema = {
  type: z.literal("optionalWithDefault"),
};

const InputPromptValidationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("optional"),
    validator: zodUnionFromEnum(InquirerInputPromptValidator).prefault("string"),
  }),
  z.object({
    type: z.literal("required"),
    validator: zodUnionFromEnum(InquirerInputPromptValidator).prefault("string"),
  }),
  z.discriminatedUnion("validator", [
    z.object({
      ...BaseOptionalWithDefaultInputPromptValidatorSchema,
      validator: z.literal("boolean"),
      value: inputPromptValidatorToZodSchema.boolean,
    }),
    z.object({
      ...BaseOptionalWithDefaultInputPromptValidatorSchema,
      validator: z.literal("number"),
      value: inputPromptValidatorToZodSchema.number,
    }),
    z.object({
      ...BaseOptionalWithDefaultInputPromptValidatorSchema,
      validator: z.literal("string").prefault("string"),
      value: inputPromptValidatorToZodSchema.string,
    }),
  ]),
]);

export const InputWorkflowStepSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("input"),
  message: NonEmptyStringSchema,
  validation: InputPromptValidationSchema,
});
