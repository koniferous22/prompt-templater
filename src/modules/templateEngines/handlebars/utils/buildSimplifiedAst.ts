import { Err, ok, Result } from "neverthrow";
import { match } from "ts-pattern";

import {
  HandlebarsAstSupportedBlockHelper,
  HandlebarsAstSupportedStatement,
  HandlebarsAstUnsupportedStatement,
} from "../../../../constants/enums/templateEngines/handlebars/ast.js";
import { isNonEmptyArray } from "../../../../utils/array/isNonEmptyArray.js";
import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import type { AppError } from "../../../../utils/deps/neverthrow/types.js";
import { zodUnionFromEnum } from "../../../../utils/deps/zod/zodUnionFromEnum.js";
import type { SimplifiedAstNode } from "./types.js";

type BuildSimplifiedAstErrorType =
  | AppError<"module_templateEngines_handlebars_buildSimplifiedAst_unsupportedAstBlockHelper">
  | AppError<"module_templateEngines_handlebars_buildSimplifiedAst_unsupportedAstStatement">
  | AppError<"module_templateEngines_handlebars_buildSimplifiedAst_unexpectedAstStatement">;

export function buildSimplifiedAst(
  ast: hbs.AST.Program,
): Result<SimplifiedAstNode[], BuildSimplifiedAstErrorType> {
  const result: SimplifiedAstNode[] = [];

  for (const stmt of ast.body) {
    const mappedStatementResult = mapStatement(stmt);
    if (mappedStatementResult.isErr()) {
      return mappedStatementResult as Err<any, typeof mappedStatementResult.error>;
    }
    if (mappedStatementResult.value !== null) {
      result.push(mappedStatementResult.value);
    }
  }

  return ok(result);
}

const HandlebarsAstSupportedStatementSchema = zodUnionFromEnum(HandlebarsAstSupportedStatement);
const HandlebarsAstUnsupportedStatementSchema = zodUnionFromEnum(HandlebarsAstUnsupportedStatement);
const HandlebarsAstSupportedBlockHelperSchema = zodUnionFromEnum(HandlebarsAstSupportedBlockHelper);

function mapStatement(
  statement: hbs.AST.Statement,
): Result<SimplifiedAstNode | null, BuildSimplifiedAstErrorType> {
  const unsupportedStatementResult = HandlebarsAstUnsupportedStatementSchema.safeParse(
    statement.type,
  );
  if (unsupportedStatementResult.success) {
    return appErr("module_templateEngines_handlebars_buildSimplifiedAst_unsupportedAstStatement", {
      statementType: statement.type,
      location: statement.loc,
    });
  }
  const supportedStatementResult = HandlebarsAstSupportedStatementSchema.safeParse(statement.type);
  if (!supportedStatementResult.success) {
    return appErr("module_templateEngines_handlebars_buildSimplifiedAst_unexpectedAstStatement", {
      statementType: statement.type,
      location: statement.loc,
    });
  }
  return match({ type: supportedStatementResult.data, statement })
    .with({ type: "CommentStatement" }, () => {
      return ok(null);
    })
    .with({ type: "ContentStatement" }, () => {
      return ok(null);
    })
    .with({ type: "MustacheStatement" }, () => {
      const mustacheStatement = statement as hbs.AST.MustacheStatement;
      const path =
        mustacheStatement.path && mustacheStatement.path.type === "PathExpression"
          ? (mustacheStatement.path as hbs.AST.PathExpression)
          : null;
      return ok({
        kind: "mustache",
        path,
        params: mustacheStatement.params ?? [],
        original: mustacheStatement,
      } satisfies SimplifiedAstNode);
    })
    .with({ type: "BlockStatement" }, () => {
      const blockStatement = statement as hbs.AST.BlockStatement;
      const helperName =
        blockStatement.path?.type === "PathExpression" && isNonEmptyArray(blockStatement.path.parts)
          ? blockStatement.path.parts[0]
          : "";

      if (helperName && !HandlebarsAstSupportedBlockHelperSchema.validate(helperName)) {
        return appErr(
          "module_templateEngines_handlebars_buildSimplifiedAst_unsupportedAstBlockHelper",
          {
            blockHelper: helperName,
            location: blockStatement.loc,
          },
        );
      }

      // The first param is usually the path the block operates on (for with/each)
      const blockPathExpr =
        blockStatement.params !== undefined &&
        isNonEmptyArray(blockStatement.params) &&
        blockStatement.params[0].type === "PathExpression"
          ? (blockStatement.params[0] as hbs.AST.PathExpression)
          : null;

      const programNodes: SimplifiedAstNode[] = [];
      if (blockStatement.program) {
        const prog = buildSimplifiedAst(blockStatement.program);
        if (prog.isErr()) {
          return prog as Err<any, typeof prog.error>;
        }
        programNodes.push(...prog.value);
      }

      const inverseNodes: SimplifiedAstNode[] = [];
      if (blockStatement.inverse) {
        const inv = buildSimplifiedAst(blockStatement.inverse);
        if (inv.isErr()) {
          return inv as Err<any, typeof inv.error>;
        }
        inverseNodes.push(...inv.value);
      }

      return ok({
        kind: "block",
        helper: helperName,
        path: blockPathExpr,
        params: blockStatement.params ?? [],
        program: programNodes,
        inverse: inverseNodes,
        original: blockStatement,
      } satisfies SimplifiedAstNode);
    })
    .exhaustive();
}
