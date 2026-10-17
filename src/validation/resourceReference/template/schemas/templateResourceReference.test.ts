import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type z from "zod";

import { TemplateResourceReferenceSchema } from "./templateResourceReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForTemplateResourceReferenceSchema = [
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "handlebars",
          path: join(__dirname, "../../../../../fixtures/workspace1/templates/test-template.hbs"),
        },
      },
      testCaseDescription: "valid absolute handlebars template input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "relative",
        filePath: {
          format: "handlebars",
          path: "templates/test-template.hbs",
        },
      },
      testCaseDescription: "valid relative handlebars template input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof TemplateResourceReferenceSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("TemplateResourceReferenceSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceReferenceSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = TemplateResourceReferenceSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
    });
  }
});
