import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  TemplateResourceAbsolutePathSchema,
  type TemplateResourceAbsolutePath,
} from "./templateResourceAbsolutePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForTemplateResourceAbsolutePathSchema = [
  {
    testInput: {
      data: {
        format: "handlebars",
        path: join(__dirname, "../../../../../fixtures/workspace1/templates/test-template.hbs"),
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
    data: z.input<typeof TemplateResourceAbsolutePathSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("TemplateResourceAbsolutePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceAbsolutePathSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = TemplateResourceAbsolutePathSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TemplateResourceAbsolutePath>();
      }
    });
  }
});
