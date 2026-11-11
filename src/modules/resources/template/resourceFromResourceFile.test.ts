import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Ok } from "neverthrow";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppErrorInstance } from "../../../utils/deps/neverthrow/types.js";
import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import {
  TemplateResourceFileSchema,
  type TemplateResourceFile,
} from "../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import { NonEmptyStringToConfigResourceReferenceSchema } from "../../../validation/resourceReference/config/codecs/nonEmptyStringToResourceReference.js";
import { WorkspaceContextSchema } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import type { ConfigResourceTypes } from "../config/factories/resourceFactories.js";
import { configResourceFromReference } from "../config/resourceFromReference.js";
import { templateResourceFromResourceFile } from "./resourceFromResourceFile.js";

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

const testCasesForTemplateResourceFromResourceFile = [
  {
    testInput: {
      data: {
        templateResourceFile: await TemplateResourceFileSchema.parseAsync({
          format: "handlebars",
          path: join(workspaceContext, "templates/test-template.hbs"),
        }),
        sourceWorkflowFixture: workflowResourceFixture1,
      },
      testCaseDescription: "correct .hbs template file",
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
      data: {
        templateResourceFile: await TemplateResourceFileSchema.parseAsync({
          format: "handlebars",
          path: join(workspaceContext, "templates/test-bad-syntax.hbs"),
        }),
        sourceWorkflowFixture: workflowResourceFixture1,
      },
      testCaseDescription: "syntactically incorrect .hbs template file",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_templateEngines_handlebars_createHandlebarsTemplate_unableToParseInput",
      },
      testBehaviourDescription: "fail with invalid structure error",
    },
  },
] satisfies {
  testInput: {
    data: {
      templateResourceFile: TemplateResourceFile;
      sourceWorkflowFixture: ConfigResourceTypes["workflow"];
    };
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

describe("templateResourceFromResourceFile - template", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceFromResourceFile) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceResult = await templateResourceFromResourceFile(
        testInput.data.templateResourceFile,
        {
          sourceWorkflow: testInput.data.sourceWorkflowFixture,
        },
      );
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
