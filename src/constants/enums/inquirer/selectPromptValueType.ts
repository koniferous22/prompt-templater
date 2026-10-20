export const InquirerSelectPromptValueType = {
  Number: "number",
  String: "string",
  Boolean: "boolean",
} as const;
export type InquirerSelectPromptValueTypeType =
  (typeof InquirerSelectPromptValueType)[keyof typeof InquirerSelectPromptValueType];
