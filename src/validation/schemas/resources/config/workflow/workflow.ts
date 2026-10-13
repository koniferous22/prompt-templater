import z from "zod";

import { TemplateResourceInputSchema } from "../../template/templateResourceInput.js";

export const WorkflowSchema = z
  .object({
    templateFile: TemplateResourceInputSchema,
  })
  .brand<"Workflow">();
