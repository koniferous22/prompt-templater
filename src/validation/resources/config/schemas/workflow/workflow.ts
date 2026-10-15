import z from "zod";

import { NonEmptyStringToTemplateResourceInputSchema } from "../../../template/codecs/nonEmptyStringToResourceInput.js";
import { WorkflowStepSchema } from "./workflowStep.js";

export const WorkflowSchema = z
  .object({
    templateFile: NonEmptyStringToTemplateResourceInputSchema,
    steps: z.array(WorkflowStepSchema),
  })
  .brand<"Workflow">();

export type Workflow = z.output<typeof WorkflowSchema>;
