import type { Selector } from "../../../../validation/resourceReference/term/schemas/selector.js";
import type { NonEmptyString } from "../../validation/string/customTypes/string.ts";

export type ExpectedType = "object" | "array" | "primitive" | "any";

export interface Constraint {
  selector: Selector;
  expectedType: ExpectedType;
  reference: {
    pathExpression: NonEmptyString | null;
    location: {
      line: number | null;
      column: number | null;
    };
  } | null;
}

export interface Template {
  getVariableConstraints(): Constraint[];
  getCompiledTemplate(): (arg: any) => string;
}
