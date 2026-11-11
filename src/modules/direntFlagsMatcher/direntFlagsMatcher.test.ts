import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import z from "zod";

import type { AppErrorCode } from "../../constants/errorCodes.js";
import { createError } from "../../utils/deps/neverthrow/errorFactory.js";
import type { AppError } from "../../utils/deps/neverthrow/types.js";
import { DirentFromDirentObjectSchema } from "../../validation/fs/schemas/direntFromDirentObject.js";
import {
  AbsolutePathSchema,
  PathFragmentSchema,
  type AbsolutePath,
  type PathFragment,
} from "../../validation/path/customTypes/index.js";
import { createDirentFlagsMatcher, type DirentFlagPatterns } from "./direntFlagsMatcher.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesWorkspaceFolder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "unit-test-workspace"),
);

const testCasesForDirentFlagsMatcher = [
  {
    testInput: {
      data: {
        inputFolderPath: fixturesWorkspaceFolder,
        expectedFlagPatterns: new Map([
          [
            PathFragmentSchema.parse("templates"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
          [
            PathFragmentSchema.parse("terms"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
          [
            PathFragmentSchema.parse("workflows"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
        ]),
        options: {
          failOnExtraItems: false,
        },
      },
      testCaseDescription:
        'input consisting of partial match of "unit-test-workspace" folder contents',
    },
    testOutcome: {
      data: {
        ok: true,
        value: undefined,
      },
      testBehaviourDescription: "return ok(undefined)",
    },
  },
  {
    testInput: {
      data: {
        inputFolderPath: fixturesWorkspaceFolder,
        expectedFlagPatterns: new Map([
          [
            PathFragmentSchema.parse("templates"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
          [
            PathFragmentSchema.parse("terms"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
          [
            PathFragmentSchema.parse("workflows"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
        ]),
        options: {
          failOnExtraItems: true,
        },
      },
      testCaseDescription: 'input expecting full match of "unit-test-workspace" folder contents',
    },
    testOutcome: {
      data: {
        ok: false,
        errors: createError("module_direntFlagsMatcher_extraItemsFound", {
          expectedFolderPath: fixturesWorkspaceFolder,
          extraItem: AbsolutePathSchema.parse(join(fixturesWorkspaceFolder, "workflow-presets")),
        }),
      },
      testBehaviourDescription: "return error",
    },
  },
  {
    testInput: {
      data: {
        inputFolderPath: fixturesWorkspaceFolder,
        expectedFlagPatterns: new Map([
          [
            PathFragmentSchema.parse("templates"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
          [
            PathFragmentSchema.parse("does-not-exist"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
        ]),
        options: {
          failOnExtraItems: false,
        },
      },
      testCaseDescription:
        'input having items not present in "unit-test-workspace" folder contents',
    },
    testOutcome: {
      data: {
        ok: false,
        errors: createError("module_direntFlagsMatcher_patternNotFound", {
          pattern: PathFragmentSchema.parse("does-not-exist"),
          parentPath: fixturesWorkspaceFolder,
        }),
      },
      testBehaviourDescription: "return error",
    },
  },
  {
    testInput: {
      data: {
        inputFolderPath: fixturesWorkspaceFolder,
        expectedFlagPatterns: new Map([
          [
            PathFragmentSchema.parse("templates"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
          [
            PathFragmentSchema.parse("terms"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
          [
            PathFragmentSchema.parse("workflow-presets"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
          [
            PathFragmentSchema.parse("workflows"),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            },
          ],
        ]),
        options: {
          failOnExtraItems: true,
        },
      },
      testCaseDescription: 'input consisting of full match of "fixtures" folder contents',
    },
    testOutcome: {
      data: {
        ok: true,
        value: undefined,
      },
      testBehaviourDescription: "return ok(undefined)",
    },
  },
] satisfies {
  testInput: {
    data: {
      inputFolderPath: AbsolutePath;
      expectedFlagPatterns: Map<PathFragment, DirentFlagPatterns>;
      options: {
        failOnExtraItems: boolean;
      };
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | { ok: true; value: undefined }
      | { ok: false; errors: AppError<AppErrorCode> | AppError<AppErrorCode>[] };
    testBehaviourDescription: string;
  };
}[];

describe("direntFlagsMatcher", () => {
  for (const { testInput, testOutcome } of testCasesForDirentFlagsMatcher) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const direntFlagsMatcher = createDirentFlagsMatcher(
        testInput.data.inputFolderPath,
        testInput.data.expectedFlagPatterns,
        testInput.data.options,
      );
      const folderContents = await readdir(testInput.data.inputFolderPath, { withFileTypes: true });
      const dirents = z.array(DirentFromDirentObjectSchema).parse(folderContents);
      const result = direntFlagsMatcher(dirents);

      if (testOutcome.data.ok === true) {
        assert.ok(result.isOk());
        expect(result.value).toBe(testOutcome.data.value);
      } else {
        assert.ok(result.isErr());
        expect(result.error).toStrictEqual(testOutcome.data.errors);
      }
    });
  }
});
