import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { NonNegativeIntegerSchema } from "../../../validation/number/customTypes/number.js";
import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import {
  TermResourceFileSchema,
  type TermResourceFile,
} from "../../../validation/resourceFile/term/codecs/resourceAbsolutePathToResourceFile.js";
import type { TermValueType } from "../../../validation/resources/term/term/factories/termByTermType.js";
import { WorkspaceContextSchema } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { termResourceFromResourceFile } from "./resourceFromResourceFile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForConfigResourceFromResourceFile = [
  {
    testInput: {
      data: {
        file: await TermResourceFileSchema.parseAsync({
          format: "json",
          path: join(workspaceContext, "terms/test-term.json"),
          selector: null,
        }),
        termType: "string",
      },
      testCaseDescription: "correct .json string term file",
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
        file: await TermResourceFileSchema.parseAsync({
          format: "json",
          path: join(workspaceContext, "terms/test-term-bad-syntax.json"),
          selector: null,
        }),
        termType: "string",
      },
      testCaseDescription: "incorrect .json string term file",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resources_term_factories_createTerm_invalidInputData",
      },
      testBehaviourDescription: "fail with invalid input data error",
    },
  },
  {
    testInput: {
      data: {
        file: await TermResourceFileSchema.parseAsync({
          format: "json",
          path: join(workspaceContext, "terms/test-term-nested.json"),
          selector: [NonNegativeIntegerSchema.parse(0), "someAttribute"],
        }),
        termType: "string",
      },
      testCaseDescription: "correct .json string term file with a selector",
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
        file: await TermResourceFileSchema.parseAsync({
          format: "json",
          path: join(workspaceContext, "terms/test-term-bad-nested-syntax.json"),
          selector: ["random"],
        }),
        termType: "string",
      },
      testCaseDescription: "incorrect .json string term file with selector",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resources_term_factories_createTerm_invalidInputData",
      },
      testBehaviourDescription: "fail with invalid input data error",
    },
  },
  {
    testInput: {
      data: {
        file: await TermResourceFileSchema.parseAsync({
          format: "yaml",
          path: join(workspaceContext, "terms/test-term.yml"),
          selector: null,
        }),
        termType: "string",
      },
      testCaseDescription: "correct .yaml string term file",
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
        file: await TermResourceFileSchema.parseAsync({
          format: "yaml",
          path: join(workspaceContext, "terms/test-term-bad-syntax.yml"),
          selector: null,
        }),
        termType: "string",
      },
      testCaseDescription: "incorrect .yaml string term file",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resources_term_factories_createTerm_invalidInputData",
      },
      testBehaviourDescription: "fail with invalid input data error",
    },
  },
  {
    testInput: {
      data: {
        file: await TermResourceFileSchema.parseAsync({
          format: "yaml",
          path: join(workspaceContext, "terms/test-term-nested.yml"),
          selector: ["someAttribute", NonNegativeIntegerSchema.parse(0), "someNestedAttribute"],
        }),
        termType: "string",
      },
      testCaseDescription: "correct .yaml string term file with a selector",
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
        file: await TermResourceFileSchema.parseAsync({
          format: "yaml",
          path: join(workspaceContext, "terms/test-term-bad-nested-syntax.yml"),
          selector: ["random"],
        }),
        termType: "string",
      },
      testCaseDescription: "incorrect .yaml string term file with selector",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resources_term_factories_createTerm_invalidInputData",
      },
      testBehaviourDescription: "fail with invalid input data error",
    },
  },
] satisfies {
  testInput: {
    data: {
      file: TermResourceFile;
      termType: TermValueType;
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

describe("termResourceFromResourceFile", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceFromResourceFile) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceResult = await termResourceFromResourceFile(
        testInput.data.file,
        testInput.data.termType,
      );
      if (testOutcome.data.result === true) {
        assert.ok(resourceResult.isOk());
      } else {
        assert.ok(resourceResult.isErr());
        assert.strictEqual(resourceResult.error.type, "plain");
        assert.strictEqual(resourceResult.error.code, testOutcome.data.errorCode);
      }
    });
  }
});
