import {
  SelectorSchema,
  type Selector,
} from "../../../../validation/resourceReference/term/schemas/selector.js";
import { resolvePathAgainstHbsBlockStatements } from "./resolvePathAgainstBlockStatements.js";
import type { LocatedPathExpression } from "./types.js";

export type ExpectedType = "object" | "array" | "primitive" | "any";

export interface Constraint {
  selector: Selector;
  expectedType: ExpectedType;
}

// Seralizes constraints from path expressions
// Note - produces potentially duplicate constraints that are left as-is
export function pathExpressionsToConstraints(
  locatedPathExpressions: LocatedPathExpression[],
): Constraint[] {
  const constraints: Constraint[] = [];

  for (const loc of locatedPathExpressions) {
    const { pathExpr, blockStatementStack } = loc;

    if (pathExpr.data) {
      const dataName = pathExpr.parts[0];

      if (dataName === "key") {
        const eachBlock = [...blockStatementStack].reverse().find((b) => b.isEach);
        if (eachBlock) {
          constraints.push({
            selector: SelectorSchema.parse(eachBlock.resolvedSelector),
            expectedType: "object",
          });
        }
      } else if (dataName === "index") {
        const eachBlock = [...blockStatementStack].reverse().find((b) => b.isEach);
        if (eachBlock) {
          constraints.push({
            selector: SelectorSchema.parse(eachBlock.resolvedSelector),
            expectedType: "array",
          });
        }
      }
      // skip rest special variable types (i.e. @root, etc)
      continue;
    }

    const selector = resolvePathAgainstHbsBlockStatements(pathExpr, blockStatementStack);
    if (!selector || selector.length === 0) {
      // pure "this" reference – the current context itself
      if (blockStatementStack.length > 0) {
        const current = blockStatementStack[blockStatementStack.length - 1]!;
        // inside an each the current context is an element of the array
        if (current.isEach) {
          constraints.push({
            selector: SelectorSchema.parse(current.resolvedSelector),
            expectedType: "array",
          });
        } else {
          // inside a with the current context is an object
          constraints.push({
            selector: SelectorSchema.parse(current.resolvedSelector),
            expectedType: "object",
          });
        }
      }
      continue;
    }

    // Heuristic type based on surrounding block
    let expectedType: ExpectedType = "any";

    // If this path is the subject of a #with → object
    if (
      loc.origin.kind === "block" &&
      loc.origin.helper === "with" &&
      loc.origin.path === pathExpr
    ) {
      expectedType = "object";
    }
    // If this path is the subject of a #each → array (or object if @key is later observed)
    else if (
      loc.origin.kind === "block" &&
      loc.origin.helper === "each" &&
      loc.origin.path === pathExpr
    ) {
      expectedType = "array";
    }
    // Path used as a simple mustache → most likely a primitive (stringified)
    else if (loc.mustache) {
      expectedType = "primitive";
    }
    // Path used as a property access (has multiple parts) → intermediate segments are objects
    else {
      expectedType = "any";
    }

    constraints.push({ selector, expectedType });

    // Also emit intermediate object constraints for deep paths
    // e.g. a.b.c  ⇒  a is object, a.b is object
    for (let i = 1; i < selector.length; i++) {
      constraints.push({
        selector: SelectorSchema.parse(selector.slice(0, i)),
        expectedType: "object",
      });
    }
  }

  return constraints;
}
