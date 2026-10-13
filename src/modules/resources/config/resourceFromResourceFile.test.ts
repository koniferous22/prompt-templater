import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { ZodError } from "zod";

import { createError } from "../../../utils/deps/neverthrow/errorFactory.js";
import type { AppErrorInstance } from "../../../utils/deps/neverthrow/types.js";
import {
  ConfigResourceFileSchema,
  type ConfigResourceFile,
} from "../../../validation/codecs/configResource/resourceAbsolutePathToResourceFile.js";
import { AbsolutePathSchema } from "../../../validation/customTypes/path.js";
import { WorkspaceContextSchema } from "../../../validation/schemas/workspaceContext.js";
import { configResourceFromConfigResourceFile } from "./resourceFromResourceFile.js";

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
        format: "json",
        path: join(workspaceContext, "workflows/test-bad-syntax.json"),
      }),
      testCaseDescription: "syntactically incorrect .json workflow resource file",
    },
    testOutcome: {
      data: {
        result: false,
        error: createError("module_resources_configResourceFromResourceFile_invalidStructure", {
          file: join(workspaceContext, "workflows/test-bad-syntax.json"),
          zodError: new ZodError([]),
        }),
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "workflows/test-bad-syntax.yml"),
      }),
      testCaseDescription: "syntactically incorrect .yaml workflow resource file",
    },
    testOutcome: {
      data: {
        result: false,
        error: createError("module_resources_configResourceFromResourceFile_invalidStructure", {
          file: join(workspaceContext, "workflows/test-bad-syntax.json"),
          zodError: new ZodError([]),
        }),
      },
      testBehaviourDescription: "succeed",
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
          error: AppErrorInstance;
        };
    testBehaviourDescription: string;
  };
}[];

describe("configResourceFromResourceFile - Workflow", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceFromResourceFile) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceResult = await configResourceFromConfigResourceFile("workflow", testInput.data);
      assert.strictEqual(resourceResult.isOk(), testOutcome.data.result);
      if (testOutcome.data.result === false) {
        // Compare only error code
        assert.strictEqual(
          resourceResult.isErr() && resourceResult.error.code,
          testOutcome.data.error.code,
        );
      }
    });
  }
});
