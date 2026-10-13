import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  ConfigResourceFileSchema,
  type ConfigResourceFile,
} from "../../../validation/codecs/configResource/resourceAbsolutePathToResourceFile.js";
import { AbsolutePathSchema } from "../../../validation/customTypes/path.js";
import {
  ConfigResourceInputSchema,
  type ConfigResourceInput,
} from "../../../validation/schemas/resources/config/utils/configResourceInput.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../validation/schemas/workspaceContext.js";
import { configResourceFileFromInput } from "./resourceFileFromInput.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForConfigResourceFileFromInput = [
  {
    testInput: {
      data: {
        userInput: ConfigResourceInputSchema.parse({
          type: "absolute",
          filePath: {
            format: "json",
            path: join(workspaceContext, "workflows/test-workflow.json"),
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .json path",
    },
    testOutcome: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "workflows/test-workflow.json"),
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: ConfigResourceInputSchema.parse({
          type: "absolute",
          filePath: {
            format: "yaml",
            path: join(workspaceContext, "workflows/test-workflow.yml"),
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .yaml path",
    },
    testOutcome: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "workflows/test-workflow.yml"),
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: ConfigResourceInputSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "workflows/test-workflow.json",
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .json path",
    },
    testOutcome: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "workflows/test-workflow.json"),
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
  {
    testInput: {
      data: {
        userInput: ConfigResourceInputSchema.parse({
          type: "relative",
          filePath: {
            format: "yaml",
            path: "workflows/test-workflow.yml",
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .yaml path",
    },
    testOutcome: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "workflows/test-workflow.yml"),
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
] satisfies {
  testInput: {
    data: {
      userInput: ConfigResourceInput;
      workspaceContext: WorkspaceContext;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: ConfigResourceFile;
    testBehaviourDescription: string;
  };
}[];

describe("configResourceFileFromInput", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceFileFromInput) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceAbsolutePathResult = await configResourceFileFromInput(
        testInput.data.userInput,
        testInput.data.workspaceContext,
      );
      assert.strictEqual(resourceAbsolutePathResult.isOk(), true);
      assert.deepEqual(
        resourceAbsolutePathResult.isOk() && resourceAbsolutePathResult.value,
        testOutcome.data,
      );
    });
  }
});
