import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../../validation/customTypes/path.js";
import {
  TemplateResourceInputSchema,
  type TemplateResourceInput,
} from "../../../validation/schemas/resources/template/templateResourceInput.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../validation/schemas/workspaceContext.js";
import { templateResourceFromInput } from "./resourceFromInput.js";

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
        userInput: TemplateResourceInputSchema.parse({
          type: "absolute",
          filePath: {
            format: "pug",
            path: join(workspaceContext, "templates/test-template.pug"),
          },
        }),
        workspaceContext,
        templateInput: templateInputFixture,
      },
      testCaseDescription: "absolute .pug path",
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
        userInput: TemplateResourceInputSchema.parse({
          type: "relative",
          filePath: {
            format: "pug",
            path: "templates/test-template.pug",
          },
        }),
        workspaceContext,
        templateInput: templateInputFixture,
      },
      testCaseDescription: "relative .pug path",
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
      userInput: TemplateResourceInput;
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
      const resourceAbsolutePathResult = await templateResourceFromInput(
        testInput.data.userInput,
        testInput.data.workspaceContext,
      );
      if (!resourceAbsolutePathResult.isOk()) {
        console.error(resourceAbsolutePathResult.error);
      }
      assert.strictEqual(resourceAbsolutePathResult.isOk(), true);
      assert.strictEqual(
        resourceAbsolutePathResult.isOk() &&
          resourceAbsolutePathResult.value(testInput.data.templateInput),
        testOutcome.data.renderResult,
      );
    });
  }
});
