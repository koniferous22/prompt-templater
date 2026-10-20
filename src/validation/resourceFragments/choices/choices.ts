import z from "zod";

import {
  InquirerSelectPromptValueType,
  type InquirerSelectPromptValueTypeType,
} from "../../../constants/enums/inquirer/selectPromptValueType.js";
import { wrapNonEmptyInputLiteralIntoArray } from "../../../utils/array/wrapNonEmptyInputLiteralIntoArray.js";
import { FileSchema } from "../../fs/schemas/file.js";
import { NonEmptyStringSchema } from "../../string/customTypes/string.js";

// Note - this schema already contains preprocessed input for choices
// namely "valueType" is present in upper scope
export const SelectWorkflowStepChoicesPreprocessedInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("plainFile"),
    file: FileSchema,
    options: z
      .object({
        failOnEmptyLines: z.boolean(),
        trimWhitespace: z.boolean(),
      })
      .prefault(() => ({
        failOnEmptyLines: true,
        trimWhitespace: true,
      })),
  }),
  z.object({
    type: z.literal("jsonFile"),
  }),
  z.object({
    type: z.literal("yamlFile"),
  }),
]);

// Codec output
// a - validated literals
// b - reference
