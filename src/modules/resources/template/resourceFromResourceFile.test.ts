import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { createError } from "../../../utils/deps/neverthrow/errorFactory.js";
import type { AppErrorInstance } from "../../../utils/deps/neverthrow/types.js";
import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import {
  TemplateResourceFileSchema,
  type TemplateResourceFile,
} from "../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import { WorkspaceContextSchema } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { templateResourceFromResourceFile } from "./resourceFromResourceFile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForTemplateResourceFromResourceFile = [
  {
    testInput: {
      data: await TemplateResourceFileSchema.parseAsync({
        format: "pug",
        path: join(workspaceContext, "templates/test-template.pug"),
      }),
      testCaseDescription: "correct .pug template file",
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
      data: await TemplateResourceFileSchema.parseAsync({
        format: "pug",
        path: join(workspaceContext, "templates/test-bad-syntax.pug"),
      }),
      testCaseDescription: "syntactically incorrect .pug template file",
    },
    testOutcome: {
      data: {
        result: false,
        error: createError("module_resources_templateResourceFromResourceFile_invalidPugContents", {
          file: join(workspaceContext, "templates/test-bad-syntax.pug"),
        }),
      },
      testBehaviourDescription: "fail with invalid structure error",
    },
  },
  {
    testInput: {
      data: await TemplateResourceFileSchema.parseAsync({
        format: "handlebars",
        path: join(workspaceContext, "templates/test-template.hbs"),
      }),
      testCaseDescription: "correct .hbs template file",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  // TODO - reenable this test case on "handlebars" proper integration
  // there's a weird library behaviour - syntax errors resultin successful template compilation that only throws errors when attempting to render anything
  // resolution / workaround
  // compile template with strict mode disallowed, that missing fields are ignored, and test by rendering with empty object
  // {
  //   testInput: {
  //     data: await TemplateResourceFileSchema.parseAsync({
  //       format: "handlebars",
  //       path: join(workspaceContext, "templates/test-bad-syntax.hbs"),
  //     }),
  //     testCaseDescription: "syntactically incorrect .hbs template file",
  //   },
  //   testOutcome: {
  //     data: {
  //       result: false,
  //       error: createError("module_resources_templateResourceFromResourceFile_errorReadingFile", {
  //         value: join(workspaceContext, "templates/test-bad-syntax.hbs"),
  //       }),
  //     },
  //     testBehaviourDescription: "fail with invalid structure error",
  //   },
  // },
] satisfies {
  testInput: {
    data: TemplateResourceFile;
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

describe("templateResourceFromResourceFile - template", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceFromResourceFile) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceResult = await templateResourceFromResourceFile(testInput.data);
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
