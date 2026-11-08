import type { NonEmptyString } from "@optique/core";
import { ok } from "neverthrow";
import { match } from "ts-pattern";
import type z from "zod";

import type { WorkflowStepChoicesValueTypeType } from "../../constants/enums/workflowStep/choicesValueType.js";
import { appErr } from "../../utils/deps/neverthrow/errorFactory.js";
import type { AbsolutePath } from "../../validation/path/customTypes/index.js";
import type { EditorWorkflowStep } from "../../validation/resourceFragments/steps/editor/schemas/editorWorkflowStep.js";
import type { InputWorkflowStep } from "../../validation/resourceFragments/steps/input/schemas/inputWorkflowStep.js";
import type { WorkflowSchema } from "../../validation/resources/config/workflow/schemas/workflow.js";
import { createTemplateVariableSpecs, type TemplateVariableSpecs } from "./factories/factory.js";

type InputWorkflowData = Pick<z.output<typeof WorkflowSchema>, "steps">;

const resolveWorkflowStepVariable = ({
  id,
  targetVariable,
}: Pick<InputWorkflowData["steps"][number], "id" | "targetVariable">) => {
  // Note - eventually more complex resolution in upcoming features
  return targetVariable ?? id;
};

type InputWorkflowStepContext =
  | Pick<InputWorkflowStep, "type" | "validation">
  | Pick<EditorWorkflowStep, "type" | "validation">
  | {
      type: "select";
      valueType: WorkflowStepChoicesValueTypeType;
    }
  | {
      type: "checkbox";
      valueType: WorkflowStepChoicesValueTypeType;
    };

const mapWorkflowStepContextToTemplateVariableSpec = (
  workflowStepContext: InputWorkflowStepContext,
) =>
  match(workflowStepContext)
    .returnType<TemplateVariableSpecs>()
    .with({ type: "input", validation: { type: "required" } }, () => ({
      specType: "primitive",
      variableType: "string",
      modifier: {
        modifierType: "none",
      },
    }))
    .with({ type: "input", validation: { type: "optional" } }, () => ({
      specType: "primitive",
      variableType: "string",
      modifier: {
        modifierType: "optional",
      },
    }))
    .with(
      { type: "input", validation: { type: "optionalWithDefault" } },
      (inputStepWithDefaultValue) => ({
        specType: "primitive",
        variableType: "string",
        modifier: {
          modifierType: "optionalWithDefault",
          defaultValue: inputStepWithDefaultValue.validation.value as NonEmptyString,
        },
      }),
    )
    .with({ type: "editor", validation: { type: "required" } }, () => ({
      specType: "primitive",
      variableType: "string",
      modifier: {
        modifierType: "none",
      },
    }))
    .with({ type: "editor", validation: { type: "optional" } }, () => ({
      specType: "primitive",
      variableType: "string",
      modifier: {
        modifierType: "optional",
      },
    }))
    .with(
      { type: "editor", validation: { type: "optionalWithDefault" } },
      (editorStepWithDefaultValue) => ({
        specType: "primitive",
        variableType: "string",
        modifier: {
          modifierType: "optionalWithDefault",
          defaultValue: editorStepWithDefaultValue.validation.value,
        },
      }),
    )
    .with({ type: "select" }, ({ valueType }) => ({
      specType: "primitive",
      variableType: valueType,
      modifier: {
        modifierType: "none",
      },
    }))
    .with({ type: "checkbox" }, ({ valueType }) => ({
      specType: "composite",
      variableType: "array",
      arrayElementType: {
        specType: "primitive",
        variableType: valueType,
        modifier: {
          modifierType: "none",
        },
      },
      modifier: {
        modifierType: "none",
      },
    }))
    .exhaustive();

export const createTemplateVariableSpecsFromWorkflowData = (
  workflowData: InputWorkflowData,
  context: { file: AbsolutePath },
) => {
  const templateVariableSpecsInputMap = new Map<string, TemplateVariableSpecs>();
  for (const workflowStep of workflowData.steps) {
    const workflowStepVariableName = resolveWorkflowStepVariable(workflowStep);
    if (templateVariableSpecsInputMap.has(workflowStepVariableName)) {
      return appErr(
        "module_templateVariableSpecs_createTemplateVariableSpecsFromWorkflowData_duplicateVariable",
        {
          variableName: workflowStepVariableName,
          workflow: context.file,
          stepId: workflowStep.id,
        },
      );
    }
    templateVariableSpecsInputMap.set(
      workflowStepVariableName,
      mapWorkflowStepContextToTemplateVariableSpec(workflowStep),
    );
  }
  const templateVariableSpecsObject = createTemplateVariableSpecs(
    Object.fromEntries(templateVariableSpecsInputMap),
  );
  return ok(templateVariableSpecsObject);
};
