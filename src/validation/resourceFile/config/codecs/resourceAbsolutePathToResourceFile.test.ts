import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  ConfigResourceAbsolutePathSchema,
  type ConfigResourceAbsolutePath,
} from "../../../resourceReference/config/schemas/configResourceAbsolutePath.js";
import {
  ConfigResourceFileSchema,
  type ConfigResourceFile,
} from "./resourceAbsolutePathToResourceFile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForConfigResourceFileSchema = [
  {
    testInput: {
      data: ConfigResourceAbsolutePathSchema.parse({
        format: "yaml",
        path: AbsolutePathSchema.parse(
          join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.yml"),
        ),
      }),
      testCaseDescription: "yaml config resource path pointing to existing file",
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
      data: ConfigResourceAbsolutePathSchema.parse({
        format: "json",
        path: AbsolutePathSchema.parse(
          join(__dirname, "../../../../../fixtures/workspace1/workflows/test-workflow.json"),
        ),
      }),
      testCaseDescription: "json config resource path pointing to existing file",
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
      data: ConfigResourceAbsolutePathSchema.parse({
        format: "yaml",
        path: AbsolutePathSchema.parse(
          join(
            __dirname,
            "../../../../../fixtures/non-existing-workspace/workflows/test-workflow.yml",
          ),
        ),
      }),
      testCaseDescription: "yaml config resource path pointing to non-existing file",
    },
    testOutcome: {
      testBehaviourDescription: "should fail",
      data: {
        result: false,
      },
    },
  },
  {
    testInput: {
      data: ConfigResourceAbsolutePathSchema.parse({
        format: "json",
        path: AbsolutePathSchema.parse(
          join(
            __dirname,
            "../../../../../fixtures/non-existing-workspace/workflows/test-workflow.json",
          ),
        ),
      }),
      testCaseDescription: "json config resource path pointing to non-existing file",
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
    data: ConfigResourceAbsolutePath;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("ConfigResourceFileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceFileSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = await ConfigResourceFileSchema.safeParseAsync(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<ConfigResourceFile>();
      }
    });
  }
});
