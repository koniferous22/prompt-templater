import { describe, it } from "bun:test";
import assert from "node:assert";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  TemplateResourceReferenceSchema,
  type TemplateResourceReference,
} from "./templateResourceReference.js";

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
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TemplateResourceReference>();
      }
    });
  }
});
