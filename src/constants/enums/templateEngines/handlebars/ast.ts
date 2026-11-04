export const HandlebarsAstUnsupportedStatement = {
  PartialStatement: "PartialStatement",
  PartialBlockStatement: "PartialBlockStatement",
  Decorator: "Decorator",
  DecoratorBlock: "DecoratorBlock",
} as const;

export type HandlebarsAstUnsupportedStatementType =
  (typeof HandlebarsAstUnsupportedStatement)[keyof typeof HandlebarsAstUnsupportedStatement];

export const HandlebarsAstSupportedStatement = {
  ContentStatement: "ContentStatement",
  CommentStatement: "CommentStatement",
  MustacheStatement: "MustacheStatement",
  BlockStatement: "BlockStatement",
} as const;

export type HandlebarsAstSupportedStatementType =
  (typeof HandlebarsAstSupportedStatement)[keyof typeof HandlebarsAstSupportedStatement];

export const HandlebarsAstSupportedBlockHelper = {
  With: "with",
  Each: "each",
  If: "if",
  Unless: "unless",
  IfEquals: "ifEquals",
  UnlessEquals: "unlessEquals",
} as const;

export type HandlebarsAstSupportedBlockHelperType =
  (typeof HandlebarsAstSupportedBlockHelper)[keyof typeof HandlebarsAstSupportedBlockHelper];
