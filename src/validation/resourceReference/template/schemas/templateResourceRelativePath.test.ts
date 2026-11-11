import { describe, expect, it } from "bun:test";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  TemplateResourceRelativePathSchema,
  type TemplateResourceRelativePath,
} from "./templateResourceRelativePath.js";

const testCasesForTemplateResourceRelativePathSchema = [
  {
    testInput: {
      data: {
        format: "handlebars",
        path: "fixtures/unit-test-workspace/templates/test-template-basic.hbs",
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
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TemplateResourceRelativePath>();
      }
    });
  }
});
