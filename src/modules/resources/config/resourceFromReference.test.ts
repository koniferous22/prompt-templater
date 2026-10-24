import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import {
  ConfigResourceReferenceSchema,
  type ConfigResourceReference,
} from "../../../validation/resourceReference/config/schemas/configResourceReference.js";
import {
  WorkflowSchema,
  type Workflow,
} from "../../../validation/resources/config/workflow/schemas/workflow.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { configResourceFromReference } from "./resourceFromReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const expectedWorkflowFixture = WorkflowSchema.parse({
  templateFile: "templates/test-template.hbs",
  steps: [],
});

const testCasesForConfigResourceFileFromReference = [
  {
    testInput: {
      data: {
        userInput: ConfigResourceReferenceSchema.parse({
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
      data: expectedWorkflowFixture,
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: ConfigResourceReferenceSchema.parse({
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
      data: expectedWorkflowFixture,
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: ConfigResourceReferenceSchema.parse({
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
      data: expectedWorkflowFixture,
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
  {
    testInput: {
      data: {
        userInput: ConfigResourceReferenceSchema.parse({
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
      data: expectedWorkflowFixture,
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
] satisfies {
  testInput: {
    data: {
      userInput: ConfigResourceReference;
      workspaceContext: WorkspaceContext;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: Workflow;
    testBehaviourDescription: string;
  };
}[];

describe("configResourceFromReference", () => {
  describe("Workflow", () => {
    for (const { testInput, testOutcome } of testCasesForConfigResourceFileFromReference) {
      it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
        const resourceAbsolutePathResult = await configResourceFromReference(
          "workflow",
          testInput.data.userInput,
          testInput.data.workspaceContext,
        );
        assert.strictEqual(resourceAbsolutePathResult.isOk(), true);
      });
    }
  });
});
