import type { NonNegativeInteger } from "../../../../validation/number/customTypes/number.ts";
import type { NonEmptyString } from "../../../../validation/string/customTypes/string.ts";

export type SimplifiedAstNode =
  | {
      kind: "block";
      helper: string;
      // the expression after the helper name
      path: hbs.AST.PathExpression | null;
      params: hbs.AST.Expression[];
      program: SimplifiedAstNode[];
      inverse: SimplifiedAstNode[];
      original: hbs.AST.BlockStatement;
    }
  | {
      kind: "mustache";
      path: hbs.AST.PathExpression | null;
      params: hbs.AST.Expression[];
      original: hbs.AST.MustacheStatement;
    };

export type HandlebarsSelector = (
  | {
      type: "stringSegment";
      value: NonEmptyString;
      shouldExpectIterable: boolean;
    }
  | {
      type: "numberSegment";
      value: NonNegativeInteger;
      shouldExpectIterable: boolean;
    }
)[];

export interface LocatedPathExpression {
  pathExpr: hbs.AST.PathExpression;
  // stack of enclosing block statements
  // * can impact context
  blockStatementStack: Array<{
    // block utility name
    helper: string;
    resolvedSelector: HandlebarsSelector;
    // ? introduces iteration
    isEach: boolean;
  }>;
  /** If the path lives inside a MustacheStatement, that mustache is recorded here */
  mustache?: Extract<SimplifiedAstNode, { kind: "mustache" }>;
  origin: SimplifiedAstNode;
}

export type ExpectedType = "any" | "iterable" | "primitive" | "object" | "array";

export interface HandlebarsConstraint {
  selector: HandlebarsSelector;
  expectedType: ExpectedType;
  reference: {
    pathExpression: NonEmptyString | null;
    location: {
      line: number | null;
      column: number | null;
    };
  } | null;
}
