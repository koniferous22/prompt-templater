import { err, ok } from "neverthrow";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { isNonEmptyArray } from "../../../../utils/array/isNonEmptyArray.js";
import { errorFromErrorList } from "../../../../utils/deps/neverthrow/errorList.js";
import type { AppError } from "../../../../utils/deps/neverthrow/types.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import { NonEmptyStringSchema } from "../../../../validation/string/customTypes/string.js";
import { handlebarsResolvePathAgainstBlockStatements } from "./resolvePathAgainstBlockStatements.js";
import type { HandlebarsConstraint, ExpectedType, LocatedPathExpression } from "./types.js";

// Seralizes constraints from path expressions
// Note - produces potentially duplicate constraints that are left as-is
export function pathExpressionsToConstraints(
  locatedPathExpressions: LocatedPathExpression[],
  ctx: {
    templateFile: AbsolutePath;
    sourceWorkflowFile: AbsolutePath;
  },
) {
  const constraints: HandlebarsConstraint[] = [];
  const errors: AppError<AppErrorCode>[] = [];

  for (const loc of locatedPathExpressions) {
    const { pathExpr, blockStatementStack } = loc;

    if (pathExpr.data) {
      const dataName = pathExpr.parts[0];

      if (dataName === "key") {
        const eachBlock = [...blockStatementStack].reverse().find((b) => b.isEach);
        if (eachBlock) {
          constraints.push({
            selector: eachBlock.resolvedSelector,
            expectedType: "object",
            reference: {
              pathExpression: NonEmptyStringSchema.nullable().parse(loc.origin.path?.original),
              location: {
                column: loc.origin.path?.loc.start.column ?? null,
                line: loc.origin.path?.loc.start.line ?? null,
              },
            },
          });
        }
      } else if (dataName === "index") {
        const eachBlock = [...blockStatementStack].reverse().find((b) => b.isEach);
        if (eachBlock) {
          constraints.push({
            selector: eachBlock.resolvedSelector,
            expectedType: "array",
            reference: {
              pathExpression: NonEmptyStringSchema.nullable().parse(loc.origin.path?.original),
              location: {
                column: loc.origin.path?.loc.start.column ?? null,
                line: loc.origin.path?.loc.start.line ?? null,
              },
            },
          });
        }
      }
      // skip rest special variable types (i.e. @root, etc)
      continue;
    }

    const selectorResult = handlebarsResolvePathAgainstBlockStatements(
      loc.origin,
      blockStatementStack,
      ctx,
    );

    if (selectorResult.isErr()) {
      errors.push(selectorResult.error);
    }

    const selector = selectorResult.isOk() ? selectorResult.value : null;
    if (!selector || selector.length === 0) {
      // pure "this" reference – the current context itself
      if (blockStatementStack.length > 0) {
        const current = blockStatementStack[blockStatementStack.length - 1]!;
        // inside an each the current context is iterable (either iterating array elements, or object values)
        if (current.isEach) {
          constraints.push({
            selector: current.resolvedSelector,
            expectedType: "iterable",
            reference: {
              pathExpression: NonEmptyStringSchema.nullable().parse(loc.origin.path?.original),
              location: {
                column: loc.origin.path?.loc.start.column ?? null,
                line: loc.origin.path?.loc.start.line ?? null,
              },
            },
          });
        } else {
          // inside a with the current context is an object
          constraints.push({
            selector: current.resolvedSelector,
            expectedType: "object",
            reference: {
              pathExpression: NonEmptyStringSchema.nullable().parse(loc.origin.path?.original),
              location: {
                column: loc.origin.path?.loc.start.column ?? null,
                line: loc.origin.path?.loc.start.line ?? null,
              },
            },
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
      expectedType = "iterable";
    }
    // Path used as a simple mustache → most likely a primitive (stringified)
    // workaround - exclude plain this
    // BUG - `this` points to parent selector
    else if (loc.mustache && loc.mustache.path?.original !== "this") {
      expectedType = "primitive";
    }
    // Path used as a property access (has multiple parts) → intermediate segments are objects
    else {
      expectedType = "any";
    }

    constraints.push({
      selector,
      expectedType,
      reference: {
        pathExpression: NonEmptyStringSchema.nullable().parse(loc.origin.path?.original),
        location: {
          column: loc.origin.path?.loc.start.column ?? null,
          line: loc.origin.path?.loc.start.line ?? null,
        },
      },
    });

    // Also emit intermediate object constraints for deep paths
    // e.g. a.b.c  ⇒  a is object, a.b is object
    for (let i = 1; i < selector.length; i++) {
      constraints.push({
        selector: selector.slice(0, i),
        expectedType: selector[i - 1]!.shouldExpectIterable ? "iterable" : "object",
        reference: {
          pathExpression: NonEmptyStringSchema.nullable().parse(loc.origin.path?.original),
          location: {
            column: loc.origin.path?.loc.start.column ?? null,
            line: loc.origin.path?.loc.start.line ?? null,
          },
        },
      });
    }
  }

  if (isNonEmptyArray(errors)) {
    return err(errorFromErrorList<(typeof errors)[number]["code"]>(...errors));
  }
  return ok(constraints);
}
