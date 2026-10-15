import { WorkflowSchema } from "../../../validation/resources/config/workflow/schemas/workflow.js";

export const configResourceTypes = {
  workflow: WorkflowSchema,
};

export type ConfigResourceType = keyof typeof configResourceTypes;

export type ConfigResourceSchemaByResourceType<
  Type extends ConfigResourceType = ConfigResourceType,
> = (typeof configResourceTypes)[Type];
