import { describe, it } from "bun:test";
import assert from "node:assert";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  TemplateResourceAbsolutePathSchema,
  type TemplateResourceAbsolutePath,
} from "../../../resourceReference/template/schemas/templateResourceAbsolutePath.js";
import {
  TemplateResourceFileSchema,
  type TemplateResourceFile,
} from "./resourceAbsolutePathToResourceFile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForTemplateResourceFileSchema = [
  {
    testInput: {
      data: TemplateResourceAbsolutePathSchema.parse({
        format: "handlebars",
        path: AbsolutePathSchema.parse(
          join(__dirname, "../../../../../fixtures/workspace1/templates/test-template.hbs"),
        ),
      }),
      testCaseDescription: "handlebars template resource path pointing to existing file",
    },
    testOutcome: {
      testBehaviourDescription: "should succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: TemplateResourceAbsolutePathSchema.parse({
        format: "handlebars",
        path: AbsolutePathSchema.parse(
          join(
            __dirname,
            "../../../../../fixtures/non-existing-workspace/templates/test-template.hbs",
          ),
        ),
      }),
      testCaseDescription: "handlebars template resource path pointing to non-existing file",
    },
    testOutcome: {
      testBehaviourDescription: "should fail",
      data: {
        result: false,
      },
    },
  },
] satisfies {
  testInput: {
    data: TemplateResourceAbsolutePath;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("TemplateResourceFileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceFileSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = await TemplateResourceFileSchema.safeParseAsync(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TemplateResourceFile>();
      }
    });
  }
});
