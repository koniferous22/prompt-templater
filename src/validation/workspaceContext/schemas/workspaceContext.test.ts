import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "path";

import { expectTypeOf } from "expect-type";

import { FolderSchema, type Folder } from "../../fs/schemas/folder.js";
import { AbsolutePathSchema } from "../../path/customTypes/index.js";
import { WorkspaceContextSchema, type WorkspaceContext } from "./workspaceContext.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesUnitTestWorkspaceFolder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "unit-test-workspace"),
);

const testCasesForWorkspaceContextSchema = [
  {
    testInput: {
      data: await FolderSchema.parseAsync(fixturesUnitTestWorkspaceFolder),
      testCaseDescription: "folder matching workspace preset",
    },
    testOutcome: {
      testBehaviourDescription: "should succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: await FolderSchema.parseAsync(projectFixturesFolder),
      testCaseDescription: "folder not matching workspace preset",
    },
    testOutcome: {
      testBehaviourDescription: "should fail",
      data: {
        result: false,
      },
    },
  },
] satisfies {
  testInput: {
    data: Folder;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("WorkspaceContextSchema", () => {
  for (const { testInput, testOutcome } of testCasesForWorkspaceContextSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = await WorkspaceContextSchema.safeParseAsync(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data.result);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<WorkspaceContext>();
      }
    });
  }
});
