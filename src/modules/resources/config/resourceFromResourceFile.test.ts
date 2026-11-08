import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import {
  ConfigResourceFileSchema,
  type ConfigResourceFile,
} from "../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import { WorkspaceContextSchema } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { configResourceFromResourceFile } from "./resourceFromResourceFile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForConfigResourceFromResourceFile = [
  {
    testInput: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "workflows/test-workflow.json"),
      }),
      testCaseDescription: "correct .json workflow resource file",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "workflows/test-workflow-bad-syntax.json"),
      }),
      testCaseDescription: "syntactically incorrect .json workflow resource file",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resources_config_factories_createWorkflow_invalidInputData",
      },
      testBehaviourDescription: "fail with invalid structure error",
    },
  },
  {
    testInput: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "workflows/test-workflow.yml"),
      }),
      testCaseDescription: "correct .yaml workflow resource file",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "workflows/test-workflow-bad-syntax.yml"),
      }),
      testCaseDescription: "syntactically incorrect .yaml workflow resource file",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resources_config_factories_createWorkflow_invalidInputData",
      },
      testBehaviourDescription: "fail with invalid structure error",
    },
  },
] satisfies {
  testInput: {
    data: ConfigResourceFile;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("configResourceFromResourceFile - Workflow", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceFromResourceFile) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceResult = await configResourceFromResourceFile("workflow", testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(resourceResult.isOk());
      } else {
        assert.ok(resourceResult.isErr());
        // Compare only error code
        expect(resourceResult.error.code).toBe(testOutcome.data.errorCode);
      }
    });
  }
});
