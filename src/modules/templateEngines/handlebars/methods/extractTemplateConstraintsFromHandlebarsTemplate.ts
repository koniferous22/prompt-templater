import { err, ok } from "neverthrow";

import { buildHandlebarsPathExpressionTree } from "../utils/buildPathExpressionTree.js";
import { extractHandlebarsPathExpressions } from "../utils/extractHandlebarsPathExpressions.js";
import { pathExpressionsToConstraints } from "../utils/handlebarsPathExpressionsToTemplateConstraints.js";

export function extractTemplateConstraintsFromHandlebarsTemplate(templateAst: hbs.AST.Program) {
  const pathExpressionTreeResult = buildHandlebarsPathExpressionTree(templateAst);
  if (pathExpressionTreeResult.isErr()) {
    return err(pathExpressionTreeResult.error.code);
  }

  const located = extractHandlebarsPathExpressions(pathExpressionTreeResult.value);
  const constraints = pathExpressionsToConstraints(located);

  return ok(constraints);
}
