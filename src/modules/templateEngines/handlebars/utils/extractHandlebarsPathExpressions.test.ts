import { describe, expect, it } from "bun:test";

import Handlebars from "handlebars";

import { buildHandlebarsPathExpressionTree } from "./buildPathExpressionTree.js";
import { extractHandlebarsPathExpressions } from "./extractHandlebarsPathExpressions.js";
import type { PathExpressionTreeNode } from "./types.js";

const testCasesForExtractHandlebarsPathExpressions = [
  {
    testInput: {
      data: buildHandlebarsPathExpressionTree(
        Handlebars.parse(`Hello {{name}}!`) as unknown as hbs.AST.Program,
      )._unsafeUnwrap(),
      testCaseDescription: "a single top-level mustache referencing a simple path",
    },
    testOutcome: {
      testBehaviourDescription:
        "return one LocatedPathExpression for the mustache path with empty blockStatementStack",
    },
  },
  {
    testInput: {
      data: buildHandlebarsPathExpressionTree(
        Handlebars.parse(`{{#with person}}
  {{firstName}}
{{/with}}`) as unknown as hbs.AST.Program,
      )._unsafeUnwrap(),
      testCaseDescription: "a #with block containing a nested mustache",
    },
    testOutcome: {
      testBehaviourDescription:
        "return LocatedPathExpressions for the block subject and the nested mustache, with the mustache carrying the with block in its blockStatementStack",
    },
  },
  {
    testInput: {
      data: buildHandlebarsPathExpressionTree(
        Handlebars.parse(`{{#each items}}
  - {{this.title}} ({{../name}})
{{else}}
  No items for {{name}}
{{/each}}`) as unknown as hbs.AST.Program,
      )._unsafeUnwrap(),
      testCaseDescription:
        "a #each block with program mustaches (including ../) and an inverse mustache",
    },
    testOutcome: {
      testBehaviourDescription:
        "return LocatedPathExpressions for the each subject, program paths (with each in blockStatementStack) and inverse path (without the each blockStatementStack)",
    },
  },
] satisfies {
  testInput: {
    data: PathExpressionTreeNode[];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data?: undefined;
  };
}[];

describe("extractHandlebarsPathExpressions", () => {
  for (const { testInput, testOutcome } of testCasesForExtractHandlebarsPathExpressions) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const handlebarsPathExpressions = extractHandlebarsPathExpressions(testInput.data);
      expect(handlebarsPathExpressions).toMatchSnapshot();
    });
  }
});
