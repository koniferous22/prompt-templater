import z from "zod";

import { NonEmptyStringToTemplateResourceReferenceSchema } from "../../../../resourceReference/template/codecs/nonEmptyStringToResourceReference.js";
import { WorkflowStepSchema } from "./workflowStep.js";

export const WorkflowSchema = z
  .object({
    templateFile: NonEmptyStringToTemplateResourceReferenceSchema,
    steps: z.array(WorkflowStepSchema),
  })
  .brand<"Workflow">();

export type Workflow = z.output<typeof WorkflowSchema>;
