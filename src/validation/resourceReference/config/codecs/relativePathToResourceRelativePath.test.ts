import { describe, it } from "bun:test";
import assert from "node:assert/strict";

import { expectTypeOf } from "expect-type";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { type RelativePath, RelativePathSchema } from "../../../path/customTypes/index.js";
import {
  ConfigResourceRelativePathSchema,
  type ConfigResourceRelativePath,
} from "../schemas/configResourceRelativePath.js";
import { RelativePathToConfigResourceRelativePath } from "./relativePathToResourceRelativePath.js";

const testCasesForRelativePathToConfigResourceRelativePath = [
  {
    testInput: {
      data: RelativePathSchema.parse("workflows/test-workflow.json"),
      testCaseDescription: "relative path of config resource with .json extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: ConfigResourceRelativePathSchema.parse({
          format: "json",
          path: "workflows/test-workflow.json",
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
  {
    testInput: {
      data: RelativePathSchema.parse("workflows/test-workflow.yml"),
      testCaseDescription: "relative path of config resource with .yml extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: ConfigResourceRelativePathSchema.parse({
          format: "yaml",
          path: "workflows/test-workflow.yml",
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
  {
    testInput: {
      data: RelativePathSchema.parse("templates/test-template.hbs"),
      testCaseDescription: "relative path (not a template)",
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
    data: RelativePath;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          value: ConfigResourceRelativePath;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("RelativePathToConfigResourceRelativePath", () => {
  for (const { testInput, testOutcome } of testCasesForRelativePathToConfigResourceRelativePath) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = RelativePathToConfigResourceRelativePath.safeParse(testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        assert.deepEqual(parsingResult.data, testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<ConfigResourceRelativePath>();
      } else {
        assert.ok(!parsingResult.success);
        assert.strictEqual(parsingResult.error.issues.length, 1);
        assert.strictEqual(
          parsingResult.error.issues[0] && parsingResult.error.issues[0].code,
          "custom",
        );
        assert.strictEqual(
          parsingResult.error.issues[0] &&
            parsingResult.error.issues[0].code === "custom" &&
            parsingResult.error.issues[0].params &&
            parsingResult.error.issues[0].params.code,
          testOutcome.data.errorCode,
        );
      }
    });
  }
});
