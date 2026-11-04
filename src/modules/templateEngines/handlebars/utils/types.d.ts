export type PathExpressionTreeNode =
  | {
      kind: "block";
      helper: string;
      // the expression after the helper name
      path: hbs.AST.PathExpression | null;
      params: hbs.AST.Expression[];
      program: PathExpressionTreeNode[];
      inverse: PathExpressionTreeNode[];
      original: hbs.AST.BlockStatement;
    }
  | {
      kind: "mustache";
      path: hbs.AST.PathExpression | null;
      params: hbs.AST.Expression[];
      original: hbs.AST.MustacheStatement;
    };

export interface LocatedPathExpression {
  pathExpr: hbs.AST.PathExpression;
  // stack of enclosing block statements
  // * can impact context
  blockStatementStack: Array<{
    helper: string;
    // selector
    // TODO - parse this as `SelectorSchema`
    resolvedSelector: (string | number)[];
    // ? introduces iteration
    isEach: boolean;
  }>;
  /** If the path lives inside a MustacheStatement, that mustache is recorded here */
  mustache?: PathExpressionTreeNode & { kind: "mustache" };
  /** Originating hierarchy node (block or mustache) */
  origin: PathExpressionTreeNode;
}
