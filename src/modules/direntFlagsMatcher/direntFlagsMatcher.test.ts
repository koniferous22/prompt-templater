import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createError, type AppError } from '../../utils/deps/neverthrow/errorFactory.js';
import type { AppErrorCode } from '../../constants/errorCodes.js';
import { AbsolutePathSchema, PathFragmentSchema, type AbsolutePath, type PathFragment } from '../../validation/customTypes/path.js';
import { createDirentFlagsMatcher, type DirentFlagPatterns } from './direntFlagsMatcher.js';
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, '../../../'))
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, 'fixtures'));

const testCasesForDirentFlagsMatcher = [
  {
    testInput: {
      data: {
        inputFolderPath: projectFixturesFolder,
        expectedFlagPatterns: new Map([
          [
            PathFragmentSchema.parse('workspace1'),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            }
          ],
        ]),
        options: {
          failOnExtraItems: false,
        }
      },
      testCaseDescription: 'input consisting of partial match of "fixtures" folder contents'
    },
    testOutcome: {
      data: {
        ok: true,
        value: undefined,
      },
      testBehaviourDescription: 'return ok(undefined)',
    },
  },
  {
    testInput: {
      data: {
        inputFolderPath: projectFixturesFolder,
        expectedFlagPatterns: new Map([
          [
            PathFragmentSchema.parse('workspace1'),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            }
          ],
        ]),
        options: {
          failOnExtraItems: true,
        }
      },
      testCaseDescription: 'input expecting full match of "fixtures" folder contents'
    },
    testOutcome: {
      data: {
        ok: false,
        errors: createError('module_direntFlagsMatcher_extraItemsFound', {
          expectedFolderPath: projectFixturesFolder,
          extraItems: [
            'workspace2',
          ]
        })
      },
      testBehaviourDescription: 'return error',
    },
  },
  {
    testInput: {
      data: {
        inputFolderPath: projectFixturesFolder,
        expectedFlagPatterns: new Map([
          [
            PathFragmentSchema.parse('workspace1'),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            }
          ],
          [
            PathFragmentSchema.parse('workspace3'),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            }
          ]
        ]),
        options: {
          failOnExtraItems: false,
        }
      },
      testCaseDescription: 'input having items not present in "fixtures" folder contents'
    },
    testOutcome: {
      data: {
        ok: false,
        errors: createError('module_direntFlagsMatcher_patternNotFound', {
          pattern: PathFragmentSchema.parse('workspace3'),
          parentPath: projectFixturesFolder,
        })
      },
      testBehaviourDescription: 'return error',
    },
  },
  {
    testInput: {
      data: {
        inputFolderPath: projectFixturesFolder,
        expectedFlagPatterns: new Map([
          [
            PathFragmentSchema.parse('workspace1'),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            }
          ],
          [
            PathFragmentSchema.parse('workspace2'),
            {
              isDirectory: true,
              isFile: false,
              isSymlink: false,
            }
          ],
        ]),
        options: {
          failOnExtraItems: true,
        }
      },
      testCaseDescription: 'input consisting of full match of "fixtures" folder contents'
    },
    testOutcome: {
      data: {
        ok: true,
        value: undefined,
      },
      testBehaviourDescription: 'return ok(undefined)',
    },
  },
] satisfies {
  testInput: {
    data: {
      inputFolderPath: AbsolutePath;
      expectedFlagPatterns: Map<PathFragment, DirentFlagPatterns>;
      options: {
        failOnExtraItems: boolean;
      }
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: { ok: true, value: undefined } | { ok: false; errors: AppError<AppErrorCode> | AppError<AppErrorCode>[]; };
    testBehaviourDescription: string;
  };
}[]

describe('direntFlagsMatcher', () => {
  for (const { testInput, testOutcome } of testCasesForDirentFlagsMatcher) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const direntFlagsMatcher = createDirentFlagsMatcher(
        testInput.data.inputFolderPath,
        testInput.data.expectedFlagPatterns,
        testInput.data.options,
      );
      const folderContents = await readdir(testInput.data.inputFolderPath, { withFileTypes: true });
      const result = direntFlagsMatcher(folderContents);

      assert.strictEqual(result.isOk(), testOutcome.data.ok);
      if (result.isOk()) {
        assert.strictEqual(result.value, testOutcome.data.value);
      } else {
        assert.deepStrictEqual(result.error, testOutcome.data.errors);
      }
    });
  }
});
