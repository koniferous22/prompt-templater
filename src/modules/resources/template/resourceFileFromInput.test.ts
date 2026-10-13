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
} from "../../../validation/schemas/resources/config/codecUtils/configResourceInput.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../validation/schemas/workspaceContext.js";
import { templateResourceFileFromInput } from "./resourceFileFromInput.js";
import { TemplateResourceInputSchema, type TemplateResourceInput } from "../../../validation/schemas/resources/template/templateResourceInput.js";
import { TemplateResourceFileSchema, type TemplateResourceFile } from "../../../validation/codecs/templateResource/resourceAbsolutePathToResourceFile.js";

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
        userInput: TemplateResourceInputSchema.parse({
          type: "absolute",
          filePath: {
            format: "pug",
            path: join(workspaceContext, "templates/template1.pug"),
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .pug path",
    },
    testOutcome: {
      data: await TemplateResourceFileSchema.parseAsync({
        format: "pug",
        path: join(workspaceContext, "templates/template1.pug"),
      }),
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
            path: "templates/template1.pug",
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .pug path",
    },
    testOutcome: {
      data: await TemplateResourceFileSchema.parseAsync({
        format: "pug",
        path: join(workspaceContext, "templates/template1.pug"),
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
] satisfies {
  testInput: {
    data: {
      userInput: TemplateResourceInput;
      workspaceContext: WorkspaceContext;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: TemplateResourceFile;
    testBehaviourDescription: string;
  };
}[];

describe("templateResourceFileFromInput", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceFileFromInput) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceAbsolutePathResult = await templateResourceFileFromInput(
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

