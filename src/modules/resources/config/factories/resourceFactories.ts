import type z from "zod";

import { WorkflowSchema } from "../../../../validation/resources/config/workflow/schemas/workflow.js";
import { workflowResourceGetReferences } from "../methods/workflow/getReferences.js";

export const configResourceSchemas = {
  workflow: WorkflowSchema,
};

export type ConfigResourceType = keyof typeof configResourceSchemas;

export type ConfigResourceSchemaByResourceType<
  Type extends ConfigResourceType = ConfigResourceType,
> = (typeof configResourceSchemas)[Type];

const createWorkflow = (workflowData: z.output<typeof WorkflowSchema>) => {
  const state = workflowData;
  return {
    getWorkflow: () => state,
    getReferences: () => workflowResourceGetReferences(state),
  };
};

export const configResourceFactories = {
  workflow: createWorkflow,
} satisfies Record<ConfigResourceType, Function>;

export type ConfigResourceTypes = {
  [key in keyof typeof configResourceFactories]: ReturnType<(typeof configResourceFactories)[key]>;
};
