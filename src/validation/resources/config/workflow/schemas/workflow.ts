import z from "zod";

import { NonEmptyStringToTemplateResourceReferenceSchema } from "../../../../resourceReference/template/codecs/nonEmptyStringToResourceReference.js";
import { EditorWorkflowStepSchema } from "../../../../resourceFragments/steps/editor/schemas/editorWorkflowStep.js";
import { InputWorkflowStepSchema } from "../../../../resourceFragments/steps/input/schemas/inputWorkflowStep.js";
import { SelectWorkflowStepSchema } from "../../../../resourceFragments/steps/select/codecs/selectWorkflowStep.js";

const WorkflowStepSchema = z.discriminatedUnion("type", [
  EditorWorkflowStepSchema,
  InputWorkflowStepSchema,
  SelectWorkflowStepSchema,
]);

export const WorkflowSchema = z
  .object({
    templateFile: NonEmptyStringToTemplateResourceReferenceSchema,
    steps: z.array(WorkflowStepSchema),
  })
  .brand<"Workflow">();

export type Workflow = z.output<typeof WorkflowSchema>;
