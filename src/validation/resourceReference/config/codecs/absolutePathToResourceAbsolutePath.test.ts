import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { type AbsolutePath, AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  ConfigResourceAbsolutePathSchema,
  type ConfigResourceAbsolutePath,
} from "../schemas/configResourceAbsolutePath.js";
import { AbsolutePathToConfigResourceAbsolutePath } from "./absolutePathToResourceAbsolutePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesWorkspace1Folder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "workspace1"),
);
const testCasesForAbsolutePathToConfigResourceAbsolutePath = [
  {
    testInput: {
      data: AbsolutePathSchema.parse(
        join(fixturesWorkspace1Folder, "workflows/test-workflow.json"),
      ),
      testCaseDescription: "absolute path of config resource with .json extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: ConfigResourceAbsolutePathSchema.parse({
          format: "json",
          path: join(fixturesWorkspace1Folder, "workflows/test-workflow.json"),
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: AbsolutePathSchema.parse(join(fixturesWorkspace1Folder, "workflows/test-workflow.yml")),
      testCaseDescription: "absolute path of config resource with .yml extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: ConfigResourceAbsolutePathSchema.parse({
          format: "yaml",
          path: join(fixturesWorkspace1Folder, "workflows/test-workflow.yml"),
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: AbsolutePathSchema.parse(join(fixturesWorkspace1Folder, "templates/test-template.hbs")),
      testCaseDescription: "absolute path (not a template)",
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
] satisfies {
  testInput: {
    data: AbsolutePath;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          value: ConfigResourceAbsolutePath;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("AbsolutePathToConfigResourceAbsolutePath", () => {
  for (const { testInput, testOutcome } of testCasesForAbsolutePathToConfigResourceAbsolutePath) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = AbsolutePathToConfigResourceAbsolutePath.safeParse(testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        assert.deepEqual(parsingResult.data, testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<ConfigResourceAbsolutePath>();
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
