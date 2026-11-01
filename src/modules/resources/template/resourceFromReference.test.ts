import assert from "node:assert/strict";
import { dirname, format, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import {
  TemplateResourceReferenceSchema,
  type TemplateResourceReference,
} from "../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { templateResourceFromReference } from "./resourceFromReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

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
      const resourceAbsolutePathResult = await templateResourceFromReference(
        testInput.data.userInput,
        testInput.data.workspaceContext,
      );
      assert.ok(resourceAbsolutePathResult.isOk());
      assert.strictEqual(
        resourceAbsolutePathResult.value(testInput.data.templateInput),
        testOutcome.data.renderResult,
      );
    });
  }
});
