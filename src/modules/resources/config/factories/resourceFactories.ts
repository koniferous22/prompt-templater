import { Ok, ok } from "neverthrow";
import type z from "zod";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import { WorkflowSchema } from "../../../../validation/resources/config/workflow/schemas/workflow.js";
import { workflowResourceGetReferences } from "../methods/workflow/getReferences.js";
import { workflowResourceGetTemplateVariableContextSpecs } from "../methods/workflow/getTemplateVariableContextSpecs.js";

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
  const state = workflowDataResult.data;
  const workflow = {
    getWorkflowData: () => state,
    getReferences: () => workflowResourceGetReferences(state),
    getTemplateVariableContextSpecs: () => workflowResourceGetTemplateVariableContextSpecs(state),
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
