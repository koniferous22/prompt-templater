import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../validation/customTypes/path.js";
import {
  ResourceAbsolutePathSchema,
  type ResourceAbsolutePath,
} from "../../validation/schemas/resources/resourceAbsolutePath.js";
import {
  ResourceUserInputSchema,
  type ResourceUserInput,
} from "../../validation/schemas/resources/resourceUserInput.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../validation/schemas/workspaceContext.js";
import { resourceAbsolutePathFromUserInput } from "./resourceAbsolutePathFromUserInput.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForDirentFlagsMatcher = [
  {
    testInput: {
      data: {
        userInput: ResourceUserInputSchema.parse({
          type: "absolute",
          filePath: {
            format: "json",
            path: "/some/path/outside/of/context/resource.json",
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .json path",
    },
    testOutcome: {
      data: ResourceAbsolutePathSchema.parse({
        format: "json",
        path: "/some/path/outside/of/context/resource.json",
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: ResourceUserInputSchema.parse({
          type: "absolute",
          filePath: {
            format: "yaml",
            path: "/some/path/outside/of/context/resource.yaml",
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .yaml path",
    },
    testOutcome: {
      data: ResourceAbsolutePathSchema.parse({
        format: "yaml",
        path: "/some/path/outside/of/context/resource.yaml",
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: ResourceUserInputSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "workflows/workflow1.json",
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .json path",
    },
    testOutcome: {
      data: ResourceAbsolutePathSchema.parse({
        format: "json",
        path: join(workspaceContext, "workflows/workflow1.json"),
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
  {
    testInput: {
      data: {
        userInput: ResourceUserInputSchema.parse({
          type: "relative",
          filePath: {
            format: "yaml",
            path: "workflows/workflow1.yaml",
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .yaml path",
    },
    testOutcome: {
      data: ResourceAbsolutePathSchema.parse({
        format: "yaml",
        path: join(workspaceContext, "workflows/workflow1.yaml"),
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
] satisfies {
  testInput: {
    data: {
      userInput: ResourceUserInput;
      workspaceContext: WorkspaceContext;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: ResourceAbsolutePath;
    testBehaviourDescription: string;
  };
}[];

describe("resourceAbsolutePathFromUserInput", () => {
  for (const { testInput, testOutcome } of testCasesForDirentFlagsMatcher) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceAbsolutePathResult = resourceAbsolutePathFromUserInput(
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
