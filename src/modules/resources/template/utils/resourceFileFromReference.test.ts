import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import {
  TemplateResourceFileSchema,
  type TemplateResourceFile,
} from "../../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import {
  TemplateResourceReferenceSchema,
  type TemplateResourceReference,
} from "../../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../../validation/workspaceContext/schemas/workspaceContext.js";
import { templateResourceFileFromReference } from "./resourceFileFromReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForTemplateResourceFileFromReference = [
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
      },
      testCaseDescription: "absolute .hbs path",
    },
    testOutcome: {
      data: await TemplateResourceFileSchema.parseAsync({
        format: "handlebars",
        path: join(workspaceContext, "templates/test-template.hbs"),
      }),
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
      },
      testCaseDescription: "relative .hbs path",
    },
    testOutcome: {
      data: await TemplateResourceFileSchema.parseAsync({
        format: "handlebars",
        path: join(workspaceContext, "templates/test-template.hbs"),
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
] satisfies {
  testInput: {
    data: {
      userInput: TemplateResourceReference;
      workspaceContext: WorkspaceContext;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: TemplateResourceFile;
    testBehaviourDescription: string;
  };
}[];

describe("templateResourceFileFromReference", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceFileFromReference) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceAbsolutePathResult = await templateResourceFileFromReference(
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
