import { Err, ok, Result } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { isNonEmptyArray } from "../../../../utils/array/isNonEmptyArray.js";
import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { resultFromOptionalErrorList } from "../../../../utils/deps/neverthrow/optionalErrorList.js";
import type { AppError } from "../../../../utils/deps/neverthrow/types.js";
import { NonNegativeIntegerSchema } from "../../../../validation/number/customTypes/number.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import { NonEmptyStringSchema } from "../../../../validation/string/customTypes/string.js";
import type { HandlebarsSelector, LocatedPathExpression, SimplifiedAstNode } from "./types.js";

const parsePathFragment = (
  rawFragment: string,
  ctx: {
    templateFile: AbsolutePath;
    sourceWorkflowFile: AbsolutePath;
    pathExpression: hbs.AST.PathExpression | null;
  },
) => {
  const nonNegativeNumberFromStringResult = z.coerce
    .number()
    .pipe(NonNegativeIntegerSchema)
    .safeParse(rawFragment);
  if (nonNegativeNumberFromStringResult.success) {
    return ok({
      type: "numberSegment" as const,
      value: nonNegativeNumberFromStringResult.data,
    });
  }
  const nonEmptyStringResult = NonEmptyStringSchema.safeParse(rawFragment);
  if (nonEmptyStringResult.success) {
    return ok({
      type: "stringSegment" as const,
      value: nonEmptyStringResult.data,
    });
  }
  return appErr(
    "module_templateEngines_handlebars_resolvePathAgainstBlockStatements_invalidPathFragment",
    {
      templateFile: ctx.templateFile,
      sourceWorkflow: ctx.sourceWorkflowFile,
      pathFragment: rawFragment,
      reference: {
        pathExpression: ctx.pathExpression?.original ?? null,
        location: {
          line: ctx.pathExpression?.loc.start.line ?? null,
          column: ctx.pathExpression?.loc.start.column ?? null,
        },
      },
    },
  );
};

export const handlebarsResolvePathAgainstBlockStatements = (
  astNode: SimplifiedAstNode,
  blockStatementStack: LocatedPathExpression["blockStatementStack"],
  ctx: {
    templateFile: AbsolutePath;
    sourceWorkflowFile: AbsolutePath;
  },
) => {
  if (!astNode.path) {
    return ok(null);
  }
  if (astNode.path.data) {
    return ok(null);
  }

  let stack = blockStatementStack;
  let depth = astNode.path.depth;

  while (depth > 0 && stack.length > 0) {
    stack = stack.slice(0, -1);
    depth--;
  }

  // Depth overflow - too many ../../
  if (depth > 0) {
    return appErr(
      "module_templateEngines_handlebars_resolvePathAgainstBlockStatements_depthOverflow",
      {
        templateFile: ctx.templateFile,
        sourceWorkflow: ctx.sourceWorkflowFile,
        reference: match(astNode)
          .with({ kind: "mustache" }, (mustacheAstNode) => ({
            pathExpression: NonEmptyStringSchema.nullable().parse(mustacheAstNode.path?.original),
            location: {
              column: mustacheAstNode.path?.loc.start.column ?? null,
              line: mustacheAstNode.path?.loc.start.line ?? null,
            },
          }))
          .with({ kind: "block" }, (blockAstNode) => ({
            pathExpression: NonEmptyStringSchema.nullable().parse(blockAstNode.path?.original),
            location: {
              column: blockAstNode.path?.loc.start.column ?? null,
              line: blockAstNode.path?.loc.start.line ?? null,
            },
          }))
          .exhaustive(),
      },
    );
  }

  // If we still have leftover depth we are looking at the root
  const base: HandlebarsSelector = isNonEmptyArray(stack)
    ? stack[stack.length - 1]!.resolvedSelector
    : [];
  // parts that are "this" or empty are ignored by the parser already
  const fragments = astNode.path.parts.filter((p) => p !== "this" && p !== ".");

  const selectorFragments = fragments.map((fragment) =>
    parsePathFragment(fragment, {
      ...ctx,
      pathExpression: astNode.path,
    }),
  );
  const errors = selectorFragments.map((result) =>
    result.isOk() ? undefined : (result as any as Err<any, AppError<AppErrorCode>>),
  );

  const aggregatedResult = isNonEmptyArray(errors)
    ? resultFromOptionalErrorList(...errors)
    : ok(null);
  if (!aggregatedResult.isOk()) {
    return aggregatedResult as any;
  }
  // purely for inferrence
  const okValues = selectorFragments.filter((result) => result.isOk());
  const selectorLength = okValues.length;
  // Expect parsed selector to be iterable only if, current astNode is `block` with helperName `each`
  const shouldExpectIterable = astNode.kind === "block" && astNode.helper === "each";
  return Result.combine(okValues).andThen((partialHbsSelector) =>
    ok([
      ...base,
      ...(partialHbsSelector.map((partialHbsSelectorFragment, index) => {
        return {
          ...partialHbsSelectorFragment,
          shouldExpectIterable: shouldExpectIterable && index === selectorLength - 1 ? true : false,
        };
      }) as any as HandlebarsSelector),
    ]),
  );
};
