export const WorkflowStepChoicesValueType = {
  Number: "number",
  String: "string",
  Boolean: "boolean",
} as const;
export type WorkflowStepChoicesValueTypeType =
  (typeof WorkflowStepChoicesValueType)[keyof typeof WorkflowStepChoicesValueType];
