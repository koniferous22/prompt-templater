import { describe, expect, it } from "bun:test";

import Handlebars from "handlebars";

import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import { buildSimplifiedAst } from "./buildSimplifiedAst.js";
import { extractHandlebarsPathExpressions } from "./extractHandlebarsPathExpressions.js";
import type { SimplifiedAstNode } from "./types.js";

const testCasesForExtractHandlebarsPathExpressions = [
  {
    testInput: {
      data: buildSimplifiedAst(
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
      data: buildSimplifiedAst(
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
      data: buildSimplifiedAst(
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
    data: SimplifiedAstNode[];
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
      const handlebarsPathExpressions = extractHandlebarsPathExpressions(testInput.data, {
        templateFile: AbsolutePathSchema.parse("/example/absolute/path/to/template"),
        sourceWorkflowFile: AbsolutePathSchema.parse("/example/absolute/path/to/workflow"),
      });
      expect(handlebarsPathExpressions).toMatchSnapshot();
    });
  }
});
