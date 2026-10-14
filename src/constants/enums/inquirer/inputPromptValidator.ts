export const InquirerInputPromptValidator = {
  Number: "number",
  String: "string",
  Boolean: "boolean",
} as const;
export type InquirerInputPromptValidatorType =
  (typeof InquirerInputPromptValidator)[keyof typeof InquirerInputPromptValidator];
