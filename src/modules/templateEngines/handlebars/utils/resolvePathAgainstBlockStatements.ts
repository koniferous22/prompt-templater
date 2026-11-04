import { isNonEmptyArray } from "../../../../utils/array/isNonEmptyArray.js";
import {
  SelectorSchema,
  type Selector,
} from "../../../../validation/resourceReference/term/schemas/selector.js";
import type { LocatedPathExpression } from "./types.js";

export function resolvePathAgainstHbsBlockStatements(
  pathExpr: hbs.AST.PathExpression | null,
  blockStatementStack: LocatedPathExpression["blockStatementStack"],
): Selector | null {
  if (!pathExpr) {
    return null;
  }

  if (pathExpr.data) {
    return null;
  }

  let effectiveChain = blockStatementStack;
  let depth = pathExpr.depth;

  while (depth > 0 && effectiveChain.length > 0) {
    effectiveChain = effectiveChain.slice(0, -1);
    depth--;
  }

  // If we still have leftover depth we are looking at the root
  const base = isNonEmptyArray(effectiveChain)
    ? effectiveChain[effectiveChain.length - 1]!.resolvedSelector
    : [];

  // parts that are "this" or empty are ignored by the parser already
  const parts = pathExpr.parts.filter((p) => p !== "this" && p !== ".");

  return SelectorSchema.parse([...base, ...parts]);
}
