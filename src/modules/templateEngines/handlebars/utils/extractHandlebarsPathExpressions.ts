import { resolvePathAgainstHbsBlockStatements } from "./resolvePathAgainstBlockStatements.js";
import type { LocatedPathExpression, PathExpressionTreeNode } from "./types.js";

export function extractHandlebarsPathExpressions(
  pathExpressionTree: PathExpressionTreeNode[],
): LocatedPathExpression[] {
  const collected: LocatedPathExpression[] = [];

  // Walk path expression tree (output of first part of preprocessing - `buildExpressionTree`)
  function walk(
    nodes: PathExpressionTreeNode[],
    blockStatementStack: LocatedPathExpression["blockStatementStack"],
  ) {
    for (const node of nodes) {
      if (node.kind === "mustache") {
        // path of the mustache itself
        if (node.path) {
          collected.push({
            pathExpr: node.path,
            blockStatementStack: [...blockStatementStack],
            mustache: node,
            origin: node,
          });
        }
        // also any PathExpressions that appear in params / hash
        collectPathsFromExpressions(node.params, blockStatementStack, node, collected);
      } else if (node.kind === "block") {
        // The path that the block operates on (e.g. the `person` in {{#with person}})
        if (node.path) {
          collected.push({
            pathExpr: node.path,
            blockStatementStack: [...blockStatementStack],
            origin: node,
          });
        }
        collectPathsFromExpressions(node.params, blockStatementStack, node, collected);

        // Resolve the selector that this block will push onto the context stack
        const resolved = resolvePathAgainstHbsBlockStatements(node.path, blockStatementStack);

        const nextBlockStatementStack = [
          ...blockStatementStack,
          {
            helper: node.helper,
            resolvedSelector: resolved ?? [],
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
  return collected;
}

function collectPathsFromExpressions(
  expressions: hbs.AST.Expression[],
  blockStatementStack: LocatedPathExpression["blockStatementStack"],
  origin: PathExpressionTreeNode,
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
