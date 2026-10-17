import assert from "node:assert";
import { dirname } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type z from "zod";

import { TemplateResourceRelativePathSchema } from "./templateResourceRelativePath.js";

const testCasesForTemplateResourceRelativePathSchema = [
  {
    testInput: {
      data: {
        format: "handlebars",
        path: "fixtures/workspace1/templates/test-template.hbs",
      },
      testCaseDescription: "valid .hbs input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof TemplateResourceRelativePathSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("TemplateResourceRelativePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceRelativePathSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = TemplateResourceRelativePathSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
    });
  }
});
