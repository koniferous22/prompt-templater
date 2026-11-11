import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { type AbsolutePath, AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  type TemplateResourceAbsolutePath,
  TemplateResourceAbsolutePathSchema,
} from "../schemas/templateResourceAbsolutePath.js";
import { AbsolutePathToTemplateResourceAbsolutePath } from "./absolutePathToResourceAbsolutePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesUnitTestWorkspaceFolder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "unit-test-workspace"),
);
const testCasesForTemplateResourceFileFromReference = [
  {
    testInput: {
      data: AbsolutePathSchema.parse(
        join(fixturesUnitTestWorkspaceFolder, "templates/test-template.hbs"),
      ),
      testCaseDescription: "absolute path with supported template extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TemplateResourceAbsolutePathSchema.parse({
          format: "handlebars",
          path: join(fixturesUnitTestWorkspaceFolder, "templates/test-template.hbs"),
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: AbsolutePathSchema.parse(
        join(fixturesUnitTestWorkspaceFolder, "workflows/test-workflow.json"),
      ),
      testCaseDescription: "absolute path (not a template)",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode:
          "validation_resourceReference_template_codecs_absolutePathToResourceAbsolutePath_invalidExtension",
      },
      testBehaviourDescription: "fail with invalid extension error",
    },
  },
] satisfies {
  testInput: {
    data: AbsolutePath;
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          value: TemplateResourceAbsolutePath;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("AbsolutePathToTemplateResourceAbsolutePath", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateResourceFileFromReference) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = AbsolutePathToTemplateResourceAbsolutePath.safeParse(testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        expect(parsingResult.data).toEqual(testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<TemplateResourceAbsolutePath>();
      } else {
        assert.ok(!parsingResult.success);
        expect(parsingResult.error.issues.length).toBe(1);
        expect(parsingResult.error.issues[0] && parsingResult.error.issues[0].code).toBe("custom");
        expect(
          parsingResult.error.issues[0] &&
            parsingResult.error.issues[0].code === "custom" &&
            parsingResult.error.issues[0].params &&
            parsingResult.error.issues[0].params.code,
        ).toBe(testOutcome.data.errorCode);
      }
    });
  }
});
