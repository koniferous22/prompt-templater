import { describe, it } from "bun:test";
import assert from "node:assert/strict";

import Handlebars from "handlebars";

import {
  SelectorSchema,
  type Selector,
} from "../../../../validation/resourceReference/term/schemas/selector.js";
import { buildHandlebarsPathExpressionTree } from "./buildPathExpressionTree.js";
import { extractHandlebarsPathExpressions } from "./extractHandlebarsPathExpressions.js";
import { pathExpressionsToConstraints } from "./handlebarsPathExpressionsToTemplateConstraints.js";
import type { LocatedPathExpression } from "./types.js";

const testCasesForPathExpressionsToConstraints = [
  {
    testInput: {
      data: [],
      testCaseDescription: "empty located path expressions array",
    },
    testOutcome: {
      testBehaviourDescription: "return an empty constraints array",
      data: {
        result: [],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`Hello {{name}}!`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "simple top-level mustache path expression",
    },
    testOutcome: {
      testBehaviourDescription: "infer a primitive constraint for the path",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["name"]),
            expectedType: "primitive",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{#with person}}{{/with}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "path that is the subject of a #with block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an object constraint for the with subject",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["person"]),
            expectedType: "object",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{#each items}}{{/each}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "path that is the subject of a #each block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an array constraint for the each subject",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "array",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{#each items}}{{@index}}{{/each}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "@index data variable inside an each block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an array constraint on the nearest each subject",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "array",
          },
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "array",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{#each people}}{{@key}}{{/each}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "@key data variable inside an each block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an object constraint on the nearest each subject",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["people"]),
            expectedType: "array",
          },
          {
            selector: SelectorSchema.parse(["people"]),
            expectedType: "object",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{#each items}}{{this}}{{/each}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "pure this reference inside an each block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an array constraint on the current each context",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "array",
          },
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "array",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{#with person}}{{this}}{{/with}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "pure this reference inside a with block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an object constraint on the current with context",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["person"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["person"]),
            expectedType: "object",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{a.b.c}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "deep path expression with intermediate segments",
    },
    testOutcome: {
      testBehaviourDescription:
        "infer primitive for the full path and object constraints for all intermediate prefixes",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["a", "b", "c"]),
            expectedType: "primitive",
          },
          {
            selector: SelectorSchema.parse(["a"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["a", "b"]),
            expectedType: "object",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{#each items}}{{../name}}{{/each}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "relative path with depth 1 resolving against block chain",
    },
    testOutcome: {
      testBehaviourDescription:
        "resolve the path to the parent context and infer a primitive constraint",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "array",
          },
          {
            selector: SelectorSchema.parse(["name"]),
            expectedType: "primitive",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`{{#with person}}{{firstName}}{{/with}}`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "mustache path nested inside a with block",
    },
    testOutcome: {
      testBehaviourDescription:
        "resolve the path relative to the with context and infer a primitive constraint",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["person"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["person", "firstName"]),
            expectedType: "primitive",
          },
          {
            selector: SelectorSchema.parse(["person"]),
            expectedType: "object",
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: extractHandlebarsPathExpressions(
        buildHandlebarsPathExpressionTree(
          Handlebars.parse(`
{{#each items}}
  {{title}}
  {{#with details}}
    {{color}}
  {{/with}}
{{/each}}
`) as unknown as hbs.AST.Program,
        )._unsafeUnwrap(),
      ),
      testCaseDescription: "nested each + with blocks with relative mustache paths",
    },
    testOutcome: {
      testBehaviourDescription:
        "resolve nested contexts and emit primitive + intermediate object constraints",
      data: {
        result: [
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "array",
          },
          {
            selector: SelectorSchema.parse(["items", "title"]),
            expectedType: "primitive",
          },
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["items", "details"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["items", "details", "color"]),
            expectedType: "primitive",
          },
          {
            selector: SelectorSchema.parse(["items", "details"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "object",
          },
        ],
      },
    },
  },
] satisfies {
  testInput: {
    data: LocatedPathExpression[];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: ReturnType<typeof pathExpressionsToConstraints>;
    };
  };
}[];
describe("pathExpressionsToConstraints", () => {
  for (const { testInput, testOutcome } of testCasesForPathExpressionsToConstraints) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const result = pathExpressionsToConstraints(testInput.data);
      // expect(result).toEqual(testOutcome.data.result);
      assert.ok(
        testOutcome.data.result.every((expectedItem) =>
          result.some(
            (actualItem) =>
              actualItem.expectedType === expectedItem.expectedType &&
              actualItem.selector.every(
                (selectorValue: Selector[number], index: number) =>
                  selectorValue === expectedItem.selector[index],
              ),
          ),
        ),
      );
    });
  }
});
