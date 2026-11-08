import { describe, expect, it } from "bun:test";

import Handlebars from "handlebars";

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
    },
  },
] satisfies {
  testInput: {
    data: LocatedPathExpression[];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
  };
}[];
describe("pathExpressionsToConstraints", () => {
  for (const { testInput, testOutcome } of testCasesForPathExpressionsToConstraints) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const result = pathExpressionsToConstraints(testInput.data);
      expect(result).toMatchSnapshot();
    });
  }
});
