import { err, ok, type Result } from "neverthrow";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { isNonEmptyArray } from "../../../../utils/array/isNonEmptyArray.js";
import { errorFromErrorList } from "../../../../utils/deps/neverthrow/errorList.js";
import type { AppError } from "../../../../utils/deps/neverthrow/types.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import { handlebarsResolvePathAgainstBlockStatements } from "./resolvePathAgainstBlockStatements.js";
import type { HandlebarsSelector, LocatedPathExpression, SimplifiedAstNode } from "./types.js";

export function extractHandlebarsPathExpressions(
  pathExpressionTree: SimplifiedAstNode[],
  ctx: {
    templateFile: AbsolutePath;
    sourceWorkflowFile: AbsolutePath;
  },
) {
  const collected: LocatedPathExpression[] = [];
  const errors: AppError<AppErrorCode>[] = [];

  function walk(
    nodes: SimplifiedAstNode[],
    blockStatementStack: LocatedPathExpression["blockStatementStack"],
  ) {
    for (const node of nodes) {
      if (node.kind === "mustache") {
        if (node.path) {
          collected.push({
            pathExpr: node.path,
            blockStatementStack: [...blockStatementStack],
            mustache: node,
            origin: node,
          });
        }
        collectPathsFromExpressions(node.params, blockStatementStack, node, collected);
      } else if (node.kind === "block") {
        if (node.path) {
          collected.push({
            pathExpr: node.path,
            blockStatementStack: [...blockStatementStack],
            origin: node,
          });
        }
        collectPathsFromExpressions(node.params, blockStatementStack, node, collected);

        const resolvedPathResult = handlebarsResolvePathAgainstBlockStatements(
          node,
          blockStatementStack,
          ctx,
        );

        let resolvedSelector: HandlebarsSelector = [];
        if (resolvedPathResult.isErr()) {
          errors.push(resolvedPathResult.error);
        } else {
          // fall back to empty selector so the walk can continue collecting sibling / sibling-subtree paths
          resolvedSelector = resolvedPathResult.value ?? [];
        }

        const nextBlockStatementStack = [
          ...blockStatementStack,
          {
            helper: node.helper,
            resolvedSelector,
            isEach: node.helper === "each",
          },
        ];

        walk(node.program, nextBlockStatementStack);
        // inverse sees the same outer chain (else branch does not inherit the block context)
        walk(node.inverse, blockStatementStack);
      }
    }
  }

  walk(pathExpressionTree, []);

  if (isNonEmptyArray(errors)) {
    return err(errorFromErrorList(...errors));
  }
  return ok(collected);
}

function collectPathsFromExpressions(
  expressions: hbs.AST.Expression[],
  blockStatementStack: LocatedPathExpression["blockStatementStack"],
  origin: SimplifiedAstNode,
  out: LocatedPathExpression[],
) {
  for (const e of expressions) {
    if (e.type === "PathExpression") {
      out.push({
        pathExpr: e as hbs.AST.PathExpression,
        blockStatementStack: [...blockStatementStack],
        origin,
      });
    } else if (e.type === "SubExpression") {
      const se = e as hbs.AST.SubExpression;
      if (se.path && se.path.type === "PathExpression") {
        out.push({
          pathExpr: se.path as hbs.AST.PathExpression,
          blockStatementStack: [...blockStatementStack],
          origin,
        });
      }
      collectPathsFromExpressions(se.params ?? [], blockStatementStack, origin, out);
    }
  }
}
