import z from "zod";

import { NonEmptyStringToTemplateResourceInputSchema } from "../../../../codecs/templateResource/nonEmptyStringToResourceInput.js";

export const WorkflowSchema = z
  .object({
    templateFile: NonEmptyStringToTemplateResourceInputSchema,
  })
  .brand<"Workflow">();

export type Workflow = z.output<typeof WorkflowSchema>;
