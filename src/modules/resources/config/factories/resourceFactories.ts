import { Ok, ok } from "neverthrow";
import type z from "zod";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import { WorkflowSchema } from "../../../../validation/resources/config/workflow/schemas/workflow.js";
import { createTemplateVariableSpecsFromWorkflowData } from "../../../templateVariableSpecs/createTemplateVariableSpecsFromWorkflowData.js";
import { workflowResourceGetReferences } from "../methods/workflow/getReferences.js";

export const configResourceSchemas = {
  workflow: WorkflowSchema,
};

export type ConfigResourceType = keyof typeof configResourceSchemas;

export type ConfigResourceSchemaByResourceType<
  Type extends ConfigResourceType = ConfigResourceType,
> = (typeof configResourceSchemas)[Type];

const createWorkflow = (
  workflowInput: z.input<typeof WorkflowSchema>,
  context: { file: AbsolutePath },
) => {
  const workflowDataResult = configResourceSchemas.workflow.safeParse(workflowInput);
  if (!workflowDataResult.success) {
    return appErr("module_resources_config_factories_createWorkflow_invalidInputData", {
      file: context.file,
      zodError: workflowDataResult.error,
    });
  }

  const workflowData = workflowDataResult.data;
  const templateVariableSpecsResult = createTemplateVariableSpecsFromWorkflowData(workflowData, {
    file: context.file,
  });
  if (!templateVariableSpecsResult.isOk()) {
    return templateVariableSpecsResult;
  }
  const workflow = {
    getAbsolutePath: () => context.file,
    getWorkflowData: () => workflowData,
    getReferences: () => workflowResourceGetReferences(workflowData),
    getTemplateVariableSpecs: () => templateVariableSpecsResult.value,
  };
  return ok(workflow);
};

export const configResourceFactories = {
  workflow: createWorkflow,
} satisfies Record<ConfigResourceType, Function>;

export type ConfigResourceTypes = {
  [key in keyof typeof configResourceFactories]: Extract<
    ReturnType<(typeof configResourceFactories)[key]>,
    Ok<any, any>
  > extends Ok<infer Wrapped, any>
    ? Wrapped
    : never;
};
