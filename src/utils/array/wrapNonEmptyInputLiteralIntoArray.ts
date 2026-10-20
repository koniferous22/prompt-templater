export const wrapNonEmptyInputLiteralIntoArray = <T extends any>(value: T) => {
  return typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
    ? [value]
    : value;
};
