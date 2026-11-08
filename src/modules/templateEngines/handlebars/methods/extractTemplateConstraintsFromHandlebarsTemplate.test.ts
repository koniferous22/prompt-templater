import { describe, it } from "bun:test";
import assert from "node:assert/strict";

import Handlebars from "handlebars";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { SelectorSchema } from "../../../../validation/resourceReference/term/schemas/selector.js";
import type { Constraint } from "../../templateEngine.js";
import { extractTemplateConstraintsFromHandlebarsTemplate } from "./extractTemplateConstraintsFromHandlebarsTemplate.js";

const handlebarsFixture1 = `
Hello {{name}}!

{{#with person}}
  {{firstName}} {{lastName}}
  lives in {{city}}
{{/with}}

{{#each items}}
  - {{this.title}} ({{../name}})
  {{#with details}}
    {{color}}
  {{/with}}
{{else}}
  No items for {{name}}
{{/each}}
`;

const testCasesForExtractTemplateConstraintsFromHandlebarsTemplate = [
  {
    testInput: {
      template: handlebarsFixture1,
      testCaseDescription: "simple content + single mustache",
    },
    testOutcome: {
      testBehaviourDescription: "return a hierarchy containing only the mustache node",
      data: {
        result: true as const,
        constraints: [
          {
            selector: SelectorSchema.parse(["name"]),
            expectedType: "primitive",
          },
          {
            selector: SelectorSchema.parse(["person"]),
            expectedType: "object",
          },
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
          {
            selector: SelectorSchema.parse(["person", "lastName"]),
            expectedType: "primitive",
          },
          {
            selector: SelectorSchema.parse(["person"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["person", "city"]),
            expectedType: "primitive",
          },
          {
            selector: SelectorSchema.parse(["person"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "array",
          },
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
            selector: SelectorSchema.parse(["name"]),
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
          {
            selector: SelectorSchema.parse(["items", "details"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["items"]),
            expectedType: "object",
          },
          {
            selector: SelectorSchema.parse(["items", "details", "color"]),
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
            selector: SelectorSchema.parse(["name"]),
            expectedType: "primitive",
          },
        ],
      },
    },
  },
] satisfies {
  testInput: {
    template: string;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data:
      | {
          result: true;
          constraints: Constraint[];
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
  };
}[];

describe("extractTemplateConstraintsFromHandlebarsTemplate", () => {
  for (const {
    testInput,
    testOutcome,
  } of testCasesForExtractTemplateConstraintsFromHandlebarsTemplate) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, () => {
      const ast = Handlebars.parse(testInput.template) as unknown as hbs.AST.Program;
      const result = extractTemplateConstraintsFromHandlebarsTemplate(ast);
      if (testOutcome.data.result === true) {
        assert.ok(result.isOk(), "expected Ok result");
        console.error(result.value);
      }
    });
  }
});
