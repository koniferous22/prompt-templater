import z from "zod";

import { TemplateResourceInputSchema } from "../templateResourceInput.js";

export const WorkflowSchema = z
  .object({
    templateFile: TemplateResourceInputSchema,
  })
  .brand<"Workflow">();
