import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Ok } from "neverthrow";

import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import { NonEmptyStringToConfigResourceReferenceSchema } from "../../../validation/resourceReference/config/codecs/nonEmptyStringToResourceReference.js";
import {
  TemplateResourceReferenceSchema,
  type TemplateResourceReference,
} from "../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import type { ConfigResourceTypes } from "../config/factories/resourceFactories.js";
import { configResourceFromReference } from "../config/resourceFromReference.js";
import { templateResourceFromReference } from "./resourceFromReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "unit-test-workspace"),
);

const workflowResourceFixture1Result = (await configResourceFromReference(
  "workflow",
  NonEmptyStringToConfigResourceReferenceSchema.parse("workflows/test-workflow.json"),
  workspaceContext,
)) as Extract<Awaited<ReturnType<typeof configResourceFromReference<"workflow">>>, Ok<any, any>>;
const workflowResourceFixture1 = workflowResourceFixture1Result._unsafeUnwrap();

const templateInputFixture: Record<string, any> = {
  name: "Alice",
  status: "active",
};

const expectedTemplateRenderingResult = "Hello Alice - Status: Active";

const testCasesForTemplateResourceFileFromInput = [
  {
    testInput: {
      data: {
        userInput: TemplateResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "handlebars",
            path: join(workspaceContext, "templates/test-template.hbs"),
          },
        }),
        workspaceContext,
        templateInput: templateInputFixture,
        sourceWorkflowFixture: workflowResourceFixture1,
      },
      testCaseDescription: "absolute .hbs path",
    },
    testOutcome: {
      data: {
        renderResult: expectedTemplateRenderingResult,
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: TemplateResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "handlebars",
            path: "templates/test-template.hbs",
          },
        }),
        workspaceContext,
        templateInput: templateInputFixture,
        sourceWorkflowFixture: workflowResourceFixture1,
      },
      testCaseDescription: "relative .hbs path",
    },
    testOutcome: {
      data: {
        renderResult: expectedTemplateRenderingResult,
      },
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
] satisfies {
  testInput: {
    data: {
      userInput: TemplateResourceReference;
      workspaceContext: WorkspaceContext;
      templateInput: Record<string, any>;
      sourceWorkflowFixture: ConfigResourceTypes["workflow"];
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      renderResult: string;
    };
    testBehaviourDescription: string;
  };
}[];

describe("templateResourceFromInput", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceFileFromInput) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceResult = await templateResourceFromReference(
        testInput.data.userInput,
        testInput.data.workspaceContext,
        {
          sourceWorkflow: testInput.data.sourceWorkflowFixture,
        },
      );
      assert.ok(resourceResult.isOk());
      const renderFn = resourceResult.value.createUnsafeRenderFunction();
      expect(renderFn(testInput.data.templateInput)).toBe(testOutcome.data.renderResult);
    });
  }
});
