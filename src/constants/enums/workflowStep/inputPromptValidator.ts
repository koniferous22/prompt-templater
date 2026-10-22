export const WorkflowStepInputPromptValidator = {
  Number: "number",
  String: "string",
  Boolean: "boolean",
} as const;
export type WorkflowStepInputPromptValidatorType =
  (typeof WorkflowStepInputPromptValidator)[keyof typeof WorkflowStepInputPromptValidator];
