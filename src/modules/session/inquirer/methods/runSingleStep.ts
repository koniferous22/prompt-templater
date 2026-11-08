import { editor, input, select } from "@inquirer/prompts";
import { ok } from "neverthrow";
import { match } from "ts-pattern";

import { appErrAsyncFromThrowable } from "../../../../utils/deps/neverthrow/errorFromThrowable.js";
import type { Workflow } from "../../../../validation/resources/config/workflow/schemas/workflow.js";
import type { ResourceContext } from "../../../resourceContext/factory/resourceContext.js";
import type { TemplateVariableContext } from "../../../templateVariableContext/factories/factory.js";
import type { TemplateVariableSpecs } from "../../../templateVariableSpecs/factories/factory.js";
import type { TemplateVariableSpecToZodSchema } from "../../../templateVariableSpecs/methods/buildZodSchema.js";

export const createInquirerRunStep =
  <
    VariableSpecs extends Record<string, TemplateVariableSpecs>,
    ZodSchemas extends {
      [key in keyof VariableSpecs]: TemplateVariableSpecToZodSchema<VariableSpecs[key]>;
    },
  >(
    resourceContext: ResourceContext,
    templateVariableContext: TemplateVariableContext<VariableSpecs, ZodSchemas>,
  ) =>
  (workflowStep: Workflow["steps"][number]) => {
    return match(workflowStep)
      .with({ type: "input" }, async (inputWorkflowStep) => {
        const templateVariableContextKey = inputWorkflowStep.targetVariable ?? inputWorkflowStep.id;
        const inputPromptResult = await appErrAsyncFromThrowable(
          () => {
            return input({
              message: inputWorkflowStep.message,
              // TODO - inject here the validator
            });
          },
          // TODO - runtime error handling - dependency_inquirer
        )();
        if (!inputPromptResult.isOk()) {
          return inputPromptResult;
        }
        const setValueResult = templateVariableContext.setValue(
          templateVariableContextKey,
          // @ts-expect-error
          inputPromptResult.value,
        );
        if (!setValueResult.isOk()) {
          return setValueResult;
        }
        return ok(undefined);
      })
      .with({ type: "editor" }, async (editorWorkflowStep) => {
        const templateVariableContextKey =
          editorWorkflowStep.targetVariable ?? editorWorkflowStep.id;
        const editorPromptResult = await appErrAsyncFromThrowable(
          () => {
            return editor({
              message: editorWorkflowStep.message,
              // TODO - inject here the
            });
          },
          // TODO - runtime error handling - dependency_inquirer
        )();
        if (!editorPromptResult.isOk()) {
          return editorPromptResult;
        }
        const setValueResult = templateVariableContext.setValue(
          templateVariableContextKey,
          // @ts-expect-error
          editorPromptResult.value,
        );
        if (!setValueResult.isOk()) {
          return setValueResult;
        }
        return ok(undefined);
      })
      .with({ type: "select" }, async (selectWorkflowStep) => {
        const templateVariableContextKey =
          selectWorkflowStep.targetVariable ?? selectWorkflowStep.id;
        const selectPromptChoicesResult = await (async () => {
          if (selectWorkflowStep.choices.type === "literalValues") {
            return match(selectWorkflowStep.choices.values)
              .with({ format: "array" }, (arrayValues) =>
                ok(
                  arrayValues.values.map((value) => ({
                    name: String(value),
                    value: value,
                  })),
                ),
              )
              .with({ format: "record" }, (recordValues) =>
                ok(
                  Object.entries(recordValues.values).map(([value, name]) => ({
                    name,
                    value,
                  })),
                ),
              )
              .exhaustive();
          }
          const termResourceResult = resourceContext.loadTerm(selectWorkflowStep.choices.reference);
          if (!termResourceResult.isOk()) {
            return termResourceResult;
          }
          return ok(
            termResourceResult.value.resource.getState().map(({ value, label, description }) => ({
              value,
              description,
              name: label,
            })),
          );
        })();
        if (!selectPromptChoicesResult.isOk()) {
          return selectPromptChoicesResult;
        }
        const selectPromptResult = await appErrAsyncFromThrowable(
          () => {
            return select({
              message: selectWorkflowStep.message,
              // @ts-expect-error
              choices: selectPromptChoicesResult.value,
            });
          },
          // TODO - runtime error handling - dependency_inquirer
        )();
        if (!selectPromptResult.isOk()) {
          return selectPromptResult;
        }
        const setValueResult = templateVariableContext.setValue(
          templateVariableContextKey,
          // @ts-expect-error
          selectPromptResult.value,
        );
        if (!setValueResult.isOk()) {
          return setValueResult;
        }
        return ok(undefined);
      })
      .with({ type: "checkbox" }, async (checkboxWorkflowStep) => {
        const templateVariableContextKey =
          checkboxWorkflowStep.targetVariable ?? checkboxWorkflowStep.id;
        const checkboxPromptChoicesResult = await (async () => {
          if (checkboxWorkflowStep.choices.type === "literalValues") {
            return match(checkboxWorkflowStep.choices.values)
              .with({ format: "array" }, (arrayValues) =>
                ok(
                  arrayValues.values.map((value) => ({
                    name: String(value),
                    value: value,
                  })),
                ),
              )
              .with({ format: "record" }, (recordValues) =>
                ok(
                  Object.entries(recordValues.values).map(([value, name]) => ({
                    name,
                    value,
                  })),
                ),
              )
              .exhaustive();
          }
          const termResourceResult = resourceContext.loadTerm(
            checkboxWorkflowStep.choices.reference,
          );
          if (!termResourceResult.isOk()) {
            return termResourceResult;
          }
          return ok(
            termResourceResult.value.resource.getState().map(({ value, label, description }) => ({
              value,
              description,
              name: label,
            })),
          );
        })();
        if (!checkboxPromptChoicesResult.isOk()) {
          return checkboxPromptChoicesResult;
        }
        const checkboxPromptResult = await appErrAsyncFromThrowable(
          () => {
            return select({
              message: checkboxWorkflowStep.message,
              // @ts-expect-error
              choices: checkboxPromptChoicesResult.value,
            });
          },
          // TODO - runtime error handling - dependency_inquirer
        )();
        if (!checkboxPromptResult.isOk()) {
          return checkboxPromptResult;
        }
        const setValueResult = templateVariableContext.setValue(
          templateVariableContextKey,
          // @ts-expect-error
          checkboxPromptResult.value,
        );
        if (!setValueResult.isOk()) {
          return setValueResult;
        }
        return ok(undefined);
      })
      .exhaustive();
  };
