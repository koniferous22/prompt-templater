import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema, type AbsolutePath } from "../../validation/customTypes/path.js";
import { FileSchema, type File } from "../../validation/schemas/fs/file.js";
import { detectWorkspaceContextFromCliInput } from "./detectWorkspaceContext.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cases

const testCasesForDetectWorkspaceContextFromCliInput = [
  {
    testInput: {
      data: {
        workflowFile: await FileSchema.parseAsync(
          join(__dirname, "../../../fixtures/workspace1/workflows/test-workflow.yml"),
        ),
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
        workflowFile: await FileSchema.parseAsync(
          join(__dirname, "../../../fixtures/workspace1/workflows/test-workflow.yml"),
        ),
        workflowPresetFile: await FileSchema.parseAsync(
          join(__dirname, "../../../fixtures/workspace1/workflow-presets/test-workflow-preset.yml"),
        ),
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
      workflowFile: File;
      workflowPresetFile: File | null;
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
      assert.strictEqual(result.isOk(), testOutcome.data.result);
      if (testOutcome.data.result === true) {
        assert.strictEqual(result.isOk() && result.value, testOutcome.data.value);
      }
    });
  }
});
