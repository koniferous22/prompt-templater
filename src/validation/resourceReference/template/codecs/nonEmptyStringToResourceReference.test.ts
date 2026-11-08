import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import { NonEmptyStringSchema, type NonEmptyString } from "../../../string/customTypes/string.js";
import {
  TemplateResourceReferenceSchema,
  type TemplateResourceReference,
} from "../schemas/templateResourceReference.js";
import { NonEmptyStringToTemplateResourceReferenceSchema } from "./nonEmptyStringToResourceReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesWorkspace1Folder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "workspace1"),
);
const testCasesForNonEmptyStringToTemplateResourceReferenceSchema = [
  {
    testInput: {
      data: NonEmptyStringSchema.parse(
        join(fixturesWorkspace1Folder, "templates/test-template.hbs"),
      ),
      testCaseDescription: "absolute path with supported template extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TemplateResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "handlebars",
            path: join(fixturesWorkspace1Folder, "templates/test-template.hbs"),
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse(
        join(fixturesWorkspace1Folder, "workflows/test-workflow.json"),
      ),
      testCaseDescription: "absolute path (not a template)",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode:
          "validation_resourceReference_template_codecs_absolutePathToResourceAbsolutePath_invalidExtension",
      },
      testBehaviourDescription: "fail with invalid extension error",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("templates/test-template.hbs"),
      testCaseDescription: "relative path with supported template extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TemplateResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "handlebars",
            path: "templates/test-template.hbs",
          },
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("workflows/test-workflow.json"),
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
    data: NonEmptyString;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          value: TemplateResourceReference;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("NonEmptyStringToTemplateResourceReferenceSchema", () => {
  for (const {
    testInput,
    testOutcome,
  } of testCasesForNonEmptyStringToTemplateResourceReferenceSchema) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = NonEmptyStringToTemplateResourceReferenceSchema.safeParse(
        testInput.data,
      );
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        expect(parsingResult.data).toEqual(testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<TemplateResourceReference>();
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
