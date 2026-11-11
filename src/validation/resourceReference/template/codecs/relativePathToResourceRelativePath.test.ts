import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";

import { expectTypeOf } from "expect-type";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { type RelativePath, RelativePathSchema } from "../../../path/customTypes/index.js";
import {
  type TemplateResourceRelativePath,
  TemplateResourceRelativePathSchema,
} from "../schemas/templateResourceRelativePath.js";
import { RelativePathToTemplateResourceRelativePath } from "./relativePathToResourceRelativePath.js";

const testCasesForTemplateResourceFileFromReference = [
  {
    testInput: {
      data: RelativePathSchema.parse("templates/test-template-basic.hbs"),
      testCaseDescription: "relative path with supported template extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TemplateResourceRelativePathSchema.parse({
          format: "handlebars",
          path: "templates/test-template-basic.hbs",
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
  {
    testInput: {
      data: RelativePathSchema.parse("workflows/test-workflow.json"),
      testCaseDescription: "relative path (not a template)",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode:
          "validation_resourceReference_template_codecs_relativePathToResourceRelativePath_invalidExtension",
      },
      testBehaviourDescription: "fail with invalid extension error",
    },
  },
] satisfies {
  testInput: {
    data: RelativePath;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          value: TemplateResourceRelativePath;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("RelativePathToTemplateResourceRelativePath", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceFileFromReference) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = RelativePathToTemplateResourceRelativePath.safeParse(testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        expect(parsingResult.data).toEqual(testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<TemplateResourceRelativePath>();
      } else {
        assert.ok(!parsingResult.success);
        expect(parsingResult.error.issues.length).toBe(1);
        expect(parsingResult.error.issues[0] && parsingResult.error.issues[0].code).toBe("custom");
        expect(
          parsingResult.error.issues[0] &&
            parsingResult.error.issues[0].code === "custom" &&
            parsingResult.error.issues[0].params &&
            parsingResult.error.issues[0].params.code,
        ).toBe(testOutcome.data.errorCode);
      }
    });
  }
});
