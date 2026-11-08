import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "path";

import type z from "zod";

import {
  AbsolutePathSchema,
  RelativePathSchema,
  type RelativePath,
} from "../../validation/path/customTypes/index.js";
import {
  HandlebarsAbsolutePathSchema,
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../validation/path/schemas/pathWithExtension.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../validation/workspaceContext/schemas/workspaceContext.js";
import { resolveWorkspaceResourceRelativePath } from "./resolveWorkspaceResourcePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForResolveWorkspaceResourceRelativePath = [
  {
    testInput: {
      data: {
        input: RelativePathSchema.parse("terms/test-term.txt"),
        workspaceContext,
      },
      testCaseDescription: "input consisting of plain relative path",
    },
    testOutcome: {
      testBehaviourDescription: "should succeed againt AbsolutePathSchema",
      data: {
        targetSchema: AbsolutePathSchema,
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        input: RelativePathSchema.parse("terms/test-term.json"),
        workspaceContext,
      },
      testCaseDescription: "input consisting of plain json relative path",
    },
    testOutcome: {
      testBehaviourDescription: "should succeed againt JsonAbsolutePathSchema",
      data: {
        targetSchema: JsonAbsolutePathSchema,
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        input: RelativePathSchema.parse("terms/test-term.yml"),
        workspaceContext,
      },
      testCaseDescription: "input consisting of plain yaml relative path",
    },
    testOutcome: {
      testBehaviourDescription: "should succeed againt YamlAbsolutePathSchema",
      data: {
        targetSchema: YamlAbsolutePathSchema,
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        input: RelativePathSchema.parse("templates/test-template.hbs"),
        workspaceContext,
      },
      testCaseDescription: "input consisting of plain handlebars relative path",
    },
    testOutcome: {
      testBehaviourDescription: "should succeed againt HandlebarsAbsolutePathSchema",
      data: {
        targetSchema: HandlebarsAbsolutePathSchema,
        result: true,
      },
    },
  },
] satisfies {
  testInput: {
    data: {
      input: RelativePath;
      workspaceContext: WorkspaceContext;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      targetSchema: z.ZodType;
      result: boolean;
    };
  };
}[];

describe("resolveWorkspaceResourceRelativePath", () => {
  for (const { testInput, testOutcome } of testCasesForResolveWorkspaceResourceRelativePath) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const resolvedPathResult = resolveWorkspaceResourceRelativePath(
        testInput.data.workspaceContext,
        testInput.data.input,
      );
      assert.ok(resolvedPathResult.isOk());
      const outputSchemaResult = testOutcome.data.targetSchema;
      const outputResult = outputSchemaResult.safeParse(resolvedPathResult.value);
      expect(testOutcome.data.result as boolean).toBe(outputResult.success);
    });
  }
});
