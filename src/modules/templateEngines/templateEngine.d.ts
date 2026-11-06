import type { Selector } from "../../../../validation/resourceReference/term/schemas/selector.js";

export type ExpectedType = "object" | "array" | "primitive" | "any";

export interface Constraint {
  selector: Selector;
  expectedType: ExpectedType;
}

export interface Template {
  getVariableConstraints(): Constraint[];
  getCompiledTemplate(): (arg: any) => string;
}
