import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import { NonEmptyStringSchema, type NonEmptyString } from "../../../string/customTypes/string.js";
import {
  ConfigResourceReferenceSchema,
  type ConfigResourceReference,
} from "../schemas/configResourceReference.js";
import { NonEmptyStringToConfigResourceReferenceSchema } from "./nonEmptyStringToResourceReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesUnitTestWorkspaceFolder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "unit-test-workspace"),
);
const testCasesForNonEmptyStringToConfigResourceReferenceSchema = [
  {
    testInput: {
      data: NonEmptyStringSchema.parse(
        join(fixturesUnitTestWorkspaceFolder, "workflows/test-workflow.json"),
      ),
      testCaseDescription: "absolute path for .json config resource",
    },
    testOutcome: {
      data: {
        result: true,
        value: ConfigResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "json",
            path: join(fixturesUnitTestWorkspaceFolder, "workflows/test-workflow.json"),
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse(
        join(fixturesUnitTestWorkspaceFolder, "workflows/test-workflow.yml"),
      ),
      testCaseDescription: "absolute path for .yaml config resource",
    },
    testOutcome: {
      data: {
        result: true,
        value: ConfigResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "yaml",
            path: join(fixturesUnitTestWorkspaceFolder, "workflows/test-workflow.yml"),
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse(
        join(fixturesUnitTestWorkspaceFolder, "templates/test-template.hbs"),
      ),
      testCaseDescription: "absolute path with invalid extension",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode:
          "validation_resourceReference_config_codecs_absolutePathToResourceAbsolutePath_invalidExtension",
      },
      testBehaviourDescription: "fail with invalid extension error",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("workflows/test-workflow.json"),
      testCaseDescription: "relative path for .json config resource",
    },
    testOutcome: {
      data: {
        result: true,
        value: ConfigResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "workflows/test-workflow.json",
          },
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("workflows/test-workflow.yml"),
      testCaseDescription: "relative path for .yaml config resource",
    },
    testOutcome: {
      data: {
        result: true,
        value: ConfigResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "yaml",
            path: "workflows/test-workflow.yml",
          },
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("templates/test-template.hbs"),
      testCaseDescription: "relative path with invalid extension",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode:
          "validation_resourceReference_config_codecs_relativePathToResourceRelativePath_invalidExtension",
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
          value: ConfigResourceReference;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("NonEmptyStringToConfigResourceReferenceSchema", () => {
  for (const {
    testInput,
    testOutcome,
  } of testCasesForNonEmptyStringToConfigResourceReferenceSchema) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = NonEmptyStringToConfigResourceReferenceSchema.safeParse(testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        expect(parsingResult.data).toEqual(testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<ConfigResourceReference>();
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
