import { WorkflowSchema } from "../../../validation/schemas/resources/config/workflow/workflow.js";

export const configResourceTypes = {
  workflow: WorkflowSchema,
};

export type ConfigResourceType = keyof typeof configResourceTypes;

export type ConfigResourceSchemaByResourceType<
  Type extends ConfigResourceType = ConfigResourceType,
> = (typeof configResourceTypes)[Type];
