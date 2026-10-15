import z from "zod";

import { NonEmptyStringSchema } from "../../../../../string/customTypes/string.js";
import { AbstractWorkflowStepSchema } from "./abstract/abstractWorkflowStep.js";

const EditorPromptOptionalValidationErrorMessageSchema = z.object({
  typeErrorMessage: NonEmptyStringSchema.optional(),
});

const EditorPromptRequiredValidationErrorMessageSchema = z.object({
  requiredErrorMessage: NonEmptyStringSchema.optional(),
  typeErrorMessage: NonEmptyStringSchema.optional(),
});

// TODO - figure out how to reorganize "shorthand" codecs
const EditorPromptOptionalValidationErrorMessageShorthandSchema = z.codec(
  z.union([NonEmptyStringSchema.optional(), EditorPromptOptionalValidationErrorMessageSchema]),
  EditorPromptOptionalValidationErrorMessageSchema,
  {
    decode: (value) => {
      return typeof value === "string" || typeof value === "undefined"
        ? {
            typeErrorMessage: value,
          }
        : value;
    },
    encode: (value) => EditorPromptOptionalValidationErrorMessageSchema.parse(value),
  },
);

const EditorPromptValidationOutputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("optional"),
    error: EditorPromptOptionalValidationErrorMessageShorthandSchema.optional(),
  }),
  z.object({
    type: z.literal("required"),
    error: EditorPromptRequiredValidationErrorMessageSchema.optional(),
  }),
  z.object({
    type: z.literal("optionalWithDefault"),
    value: NonEmptyStringSchema,
    error: EditorPromptOptionalValidationErrorMessageShorthandSchema.optional(),
  }),
]);

// TODO - figure out how to reorganize "shorthand" codecs
const EditorPromptValidationShorthandSchema = z.codec(
  z.union([z.literal("optional"), z.literal("required"), EditorPromptValidationOutputSchema]),
  EditorPromptValidationOutputSchema,
  {
    decode: (value) => {
      return typeof value === "string"
        ? {
            type: value,
          }
        : value;
    },
    encode: (value) => EditorPromptValidationOutputSchema.parse(value),
  },
);

export const EditorWorkflowStepSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("editor"),
  message: NonEmptyStringSchema,
  validation: EditorPromptValidationShorthandSchema,
});
