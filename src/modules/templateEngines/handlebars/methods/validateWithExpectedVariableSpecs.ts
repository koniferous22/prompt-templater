import { err, ok } from "neverthrow";
import { match } from "ts-pattern";

import { isNonEmptyArray } from "../../../../utils/array/isNonEmptyArray.js";
import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { errorFromErrorList } from "../../../../utils/deps/neverthrow/errorList.js";
import type { AppError } from "../../../../utils/deps/neverthrow/types.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import type { TemplateVariableSpecs } from "../../../templateVariableSpecs/factories/factory.js";
import { buildSimplifiedAst } from "../utils/buildSimplifiedAst.js";
import { extractHandlebarsPathExpressions } from "../utils/extractHandlebarsPathExpressions.js";
import { pathExpressionsToConstraints } from "../utils/handlebarsPathExpressionsToTemplateConstraints.js";
import type { HandlebarsConstraint, HandlebarsSelector } from "../utils/types.js";

type ValidateTemplateInputShapeErrorResult =
  | AppError<"module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidReference">
  | AppError<"module_templateEngines_handlebars_validateExpectedVariableSpecs_attributeNotFound">
  | AppError<"module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidType">;

const getNestedSpecsByHandlebarsSelector = (
  specs: TemplateVariableSpecs,
  handlebarsSelector: HandlebarsSelector,
  ctx: {
    templateFile: AbsolutePath;
    sourceWorkflowFile: AbsolutePath;
    reference: HandlebarsConstraint["reference"];
  },
) => {
  let current: TemplateVariableSpecs = specs;
  let isCurrentItemIterable = false;
  for (
    let selectorSegmentIndex = 0;
    selectorSegmentIndex < handlebarsSelector.length;
    selectorSegmentIndex++
  ) {
    const handlebarsSelectorSegment = handlebarsSelector[selectorSegmentIndex]!;
    if (handlebarsSelectorSegment.type === "stringSegment") {
      if (current.specType !== "composite") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidReference",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: ctx.reference,
            selector: handlebarsSelector.map(({ value }) => value),
            faillingSegment: handlebarsSelectorSegment.value,
            faillingSegmentIndex: selectorSegmentIndex,
            expected: "object",
            actual: current.variableType,
          },
        );
      }
      if (isCurrentItemIterable === true && current.variableType === "array") {
        // if last iteration expected current element to be iterable, then array element can be resolved instead
        isCurrentItemIterable = false;
        current = current.arrayElementType;
        // Recheck the "composite" constraint on array element type and continue
        if (current.specType !== "composite") {
          return appErr(
            "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidReference",
            {
              templateFile: ctx.templateFile,
              sourceWorkflow: ctx.sourceWorkflowFile,
              reference: ctx.reference,
              selector: handlebarsSelector.map(({ value }) => value),
              faillingSegment: handlebarsSelectorSegment.value,
              faillingSegmentIndex: selectorSegmentIndex,
              expected: "object",
              actual: current.variableType,
            },
          );
        }
      }
      if (current.variableType !== "object") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidReference",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: ctx.reference,
            selector: handlebarsSelector.map(({ value }) => value),
            faillingSegment: handlebarsSelectorSegment.value,
            faillingSegmentIndex: selectorSegmentIndex,
            expected: "object",
            actual: current.variableType,
          },
        );
      }
      if (!(handlebarsSelectorSegment.value in current.objectShapeType)) {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_attributeNotFound",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: ctx.reference,
            selector: handlebarsSelector.map(({ value }) => value),
            faillingSegment: handlebarsSelectorSegment.value,
            faillingSegmentIndex: selectorSegmentIndex,
          },
        );
      }
      // @ts-expect-error
      current = current.objectShapeType[handlebarsSelectorSegment.value];
      isCurrentItemIterable = handlebarsSelectorSegment.shouldExpectIterable;
      continue;
    }
    if (handlebarsSelectorSegment.type === "numberSegment") {
      if (current.specType !== "composite" || current.variableType !== "array") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidReference",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: ctx.reference,
            selector: handlebarsSelector.map(({ value }) => value),
            faillingSegment: handlebarsSelectorSegment.value,
            faillingSegmentIndex: selectorSegmentIndex,
            expected: "array",
            actual: current.variableType,
          },
        );
      }
      current = current.arrayElementType;
      isCurrentItemIterable = handlebarsSelectorSegment.shouldExpectIterable;
      continue;
    }
  }
  return ok(current);
};

const validateHandlebarsConstraintAgainstInputShape = (
  specs: TemplateVariableSpecs,
  constraint: HandlebarsConstraint,
  ctx: {
    templateFile: AbsolutePath;
    sourceWorkflowFile: AbsolutePath;
  },
) => {
  const { selector } = constraint;
  const nestedSpecs = getNestedSpecsByHandlebarsSelector(specs, selector, {
    ...ctx,
    reference: constraint.reference,
  });
  if (!nestedSpecs.isOk()) {
    return nestedSpecs;
  }
  return match(constraint.expectedType)
    .with("array", () => {
      if (nestedSpecs.value.specType !== "composite") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidType",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: constraint.reference,
            selector: selector.map(({ value }) => value),
            expectedType: constraint.expectedType,
            expectedTypeDescription: null,
            actualType: nestedSpecs.value.variableType,
          },
        );
      }
      if (nestedSpecs.value.variableType !== "array") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidType",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: constraint.reference,
            selector: selector.map(({ value }) => value),
            expectedType: constraint.expectedType,
            expectedTypeDescription: null,
            actualType: nestedSpecs.value.variableType,
          },
        );
      }
      return ok(undefined);
    })
    .with("object", () => {
      if (nestedSpecs.value.specType !== "composite") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidType",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: constraint.reference,
            selector: selector.map(({ value }) => value),
            expectedType: constraint.expectedType,
            expectedTypeDescription: null,
            actualType: nestedSpecs.value.variableType,
          },
        );
      }
      if (nestedSpecs.value.variableType !== "object") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidType",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: constraint.reference,
            selector: selector.map(({ value }) => value),
            expectedType: constraint.expectedType,
            expectedTypeDescription: null,
            actualType: nestedSpecs.value.variableType,
          },
        );
      }
      return ok(undefined);
    })
    .with("iterable", () => {
      if (nestedSpecs.value.specType !== "composite") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidType",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: constraint.reference,
            selector: selector.map(({ value }) => value),
            expectedType: constraint.expectedType,
            expectedTypeDescription: "non-primitive iterable type (object or array)",
            actualType: nestedSpecs.value.variableType,
          },
        );
      }
      return ok(undefined);
    })
    .with("primitive", () => {
      if (nestedSpecs.value.specType !== "primitive") {
        return appErr(
          "module_templateEngines_handlebars_validateExpectedVariableSpecs_invalidType",
          {
            templateFile: ctx.templateFile,
            sourceWorkflow: ctx.sourceWorkflowFile,
            reference: constraint.reference,
            selector: selector.map(({ value }) => value),
            expectedType: constraint.expectedType,
            expectedTypeDescription: "primitive type",
            actualType: nestedSpecs.value.variableType,
          },
        );
      }
      return ok(undefined);
    })
    .with("any", () => {
      return ok(undefined);
    })
    .exhaustive();
};

export const handlebarsTemplateValidateWithExpectedVariableSpecs = (
  templateAst: hbs.AST.Program,
  specs: TemplateVariableSpecs,
  ctx: {
    templateFile: AbsolutePath;
    sourceWorkflowFile: AbsolutePath;
  },
) => {
  const pathExpressionTreeResult = buildSimplifiedAst(templateAst);
  if (pathExpressionTreeResult.isErr()) {
    return pathExpressionTreeResult;
  }

  const locatedPathExpressionsResult = extractHandlebarsPathExpressions(
    pathExpressionTreeResult.value,
    ctx,
  );
  if (!locatedPathExpressionsResult.isOk()) {
    return locatedPathExpressionsResult;
  }
  const constraintsResult = pathExpressionsToConstraints(locatedPathExpressionsResult.value, ctx);
  if (!constraintsResult.isOk()) {
    return constraintsResult;
  }
  const errors: ValidateTemplateInputShapeErrorResult[] = [];
  for (const constraint of constraintsResult.value) {
    const validationResult = validateHandlebarsConstraintAgainstInputShape(specs, constraint, ctx);
    if (!validationResult.isOk()) {
      errors.push(validationResult.error);
    }
  }
  return isNonEmptyArray(errors)
    ? err(errorFromErrorList<(typeof errors)[number]["code"]>(...errors))
    : ok(undefined);
};
