import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema, type AbsolutePath } from "../../validation/path/customTypes/index.js";
import {
  ConfigResourceFileSchema,
  type ConfigResourceFile,
} from "../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import { detectWorkspaceContextFromCliInput } from "./detectWorkspaceContext.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cases

const testCasesForDetectWorkspaceContextFromCliInput = [
  {
    testInput: {
      data: {
        workflowFile: await ConfigResourceFileSchema.parseAsync({
          format: "yaml",
          path: join(__dirname, "../../../fixtures/workspace1/workflows/test-workflow.yml"),
        }),
        workflowPresetFile: null,
      },
      testCaseDescription: "existing workflow file",
    },
    testOutcome: {
      testBehaviourDescription: "should succeed",
      data: {
        result: true,
        value: AbsolutePathSchema.parse(join(__dirname, "../../../fixtures/workspace1")),
      },
    },
  },
  {
    testInput: {
      data: {
        workflowFile: await ConfigResourceFileSchema.parseAsync({
          format: "yaml",
          path: join(__dirname, "../../../fixtures/workspace1/workflows/test-workflow.yml"),
        }),
        workflowPresetFile: await ConfigResourceFileSchema.parseAsync({
          format: "yaml",
          path: join(
            __dirname,
            "../../../fixtures/workspace1/workflow-presets/test-workflow-preset.yml",
          ),
        }),
      },
      testCaseDescription: "existing workflow file and workflow preset file",
    },
    testOutcome: {
      testBehaviourDescription: "should succeed",
      data: {
        result: true,
        value: AbsolutePathSchema.parse(join(__dirname, "../../../fixtures/workspace1")),
      },
    },
  },
] satisfies {
  testInput: {
    data: {
      workflowFile: ConfigResourceFile;
      workflowPresetFile: ConfigResourceFile | null;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: true;
      value: AbsolutePath;
    };
  };
}[];

describe("detectWorkspaceContextFromCliInput", () => {
  for (const { testInput, testOutcome } of testCasesForDetectWorkspaceContextFromCliInput) {
    it(`for ${testInput.testCaseDescription}, context detection ${testOutcome.testBehaviourDescription}`, async () => {
      const result = await detectWorkspaceContextFromCliInput({
        workflow: testInput.data.workflowFile,
        workflowPreset: testInput.data.workflowPresetFile ?? undefined,
      });
      if (testOutcome.data.result === true) {
        assert.ok(result.isOk());
        assert.strictEqual(result.value, testOutcome.data.value);
      } else {
        assert.ok(result.isErr());
      }
    });
  }
});
