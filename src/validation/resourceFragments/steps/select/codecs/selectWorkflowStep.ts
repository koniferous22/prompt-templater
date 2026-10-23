import { match } from "ts-pattern";
import z from "zod";

import { WorkflowStepChoicesValueType } from "../../../../../constants/enums/workflowStep/choicesValueType.js";
import { zodUnionFromEnum } from "../../../../../utils/deps/zod/zodUnionFromEnum.js";
import { WorkflowChoicesFragmentToTermResourceReference } from "../../../../resourceReference/term/codecs/workflowChoicesFragmentToResourceReference.js";
import { NonEmptyStringSchema } from "../../../../string/customTypes/string.js";
import { ChoicesSchema } from "../../../choices/schemas/choices.js";
import { ChoicesInputSchema } from "../../../choices/schemas/choicesInput.js";
import { AbstractWorkflowStepSchema } from "../../abstract/schemas/abstractWorkflowStep.js";

const SelectWorkflowStepInputSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("select"),
  message: NonEmptyStringSchema,
  valueType: zodUnionFromEnum(WorkflowStepChoicesValueType).default("string"),
  choices: ChoicesInputSchema,
});

const SelectWorkflowStepOuptutSchema = AbstractWorkflowStepSchema.safeExtend({
  type: z.literal("select"),
  message: NonEmptyStringSchema,
  valueType: zodUnionFromEnum(WorkflowStepChoicesValueType),
  choices: ChoicesSchema,
});

export const SelectWorkflowStepSchema = z.codec(
  SelectWorkflowStepInputSchema,
  SelectWorkflowStepOuptutSchema,
  {
    decode: ({ valueType, choices: choicesAsLiterals, ...rest }) => {
      const choicesResult = match(choicesAsLiterals)
        .returnType<z.output<typeof ChoicesSchema>>()
        .with({ type: "reference" }, (choicesAsReference) => {
          return choicesAsReference;
        })
        // @ts-expect-error todo fix
        .with({ type: "literal", format: "array" }, (choicesAsArrayLiterals) => {
          return {
            type: "literalValues" as const,
            values: {
              ...choicesAsArrayLiterals,
              // injected from scope above
              valueType,
            },
          };
        })
        // @ts-expect-error
        .with({ type: "literal", format: "record" }, (choicesAsRecordLiterals) => {
          return {
            type: "literalValues" as const,
            values: {
              ...choicesAsRecordLiterals,
              // injected from scope above
              valueType,
            },
          };
        })
        .with({ type: "jsonFile" }, (choicesAsJsonFile) => {
          const jsonReferenceResult =
            WorkflowChoicesFragmentToTermResourceReference.safeParse(choicesAsJsonFile);
          if (!jsonReferenceResult.success) {
            // TODO - define error code and all that stuff
            return z.NEVER;
          }
          return {
            type: "reference" as const,
            reference: jsonReferenceResult.data,
          };
        })
        .with({ type: "yamlFile" }, (choicesAsYamlFile) => {
          const yamlReferenceResult =
            WorkflowChoicesFragmentToTermResourceReference.safeDecode(choicesAsYamlFile);
          if (!yamlReferenceResult.success) {
            // TODO - define error code and all that stuff
            return z.NEVER;
          }
          return {
            type: "reference" as const,
            reference: yamlReferenceResult.data,
          };
        })
        .with({ type: "plainFile" }, (choicesAsPlainFile) => {
          const plainReferenceResult =
            WorkflowChoicesFragmentToTermResourceReference.safeParse(choicesAsPlainFile);
          if (!plainReferenceResult.success) {
            // TODO - define error code and all that stuff
            return z.NEVER;
          }
          return {
            type: "reference" as const,
            reference: plainReferenceResult.data,
          };
        })
        // @ts-expect-error
        .exhaustive();
      return {
        ...rest,
        valueType,
        choices: choicesResult,
      };
    },
    // @ts-expect-error unused
    encode: ({ choices, ...rest }) => {
      const choicesResult = match(choices)
        .with({ type: "literalValues" }, (choicesAsLiteralValues) => {
          return {
            type: "literal" as const,
            values: choicesAsLiteralValues.values,
          };
        })
        .with({ type: "reference" }, (choicesAsReference) => {
          return match(choicesAsReference.reference.filePath)
            .with({ format: "json" }, (filePathAsJsonReference) => {
              return {
                type: "jsonFile" as const,
                file: filePathAsJsonReference.path,
                selector: filePathAsJsonReference.selector,
              };
            })
            .with({ format: "yaml" }, (filePathAsYamlReference) => {
              return {
                type: "yamlFile" as const,
                file: filePathAsYamlReference.path,
                selector: filePathAsYamlReference.selector,
              };
            })
            .with({ format: "plaintext" }, (filePathAsPlaintextReference) => {
              return {
                type: "plainFile" as const,
                file: filePathAsPlaintextReference.path,
              };
            });
        });
      return {
        ...rest,
        choices: choicesResult,
      };
    },
  },
);
