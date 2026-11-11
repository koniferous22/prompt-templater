import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import type { DirentFlagPatterns } from "../../../modules/direntFlagsMatcher/direntFlagsMatcher.js";
import {
  AbsolutePathSchema,
  PathFragmentSchema,
  RelativePathSchema,
  type AbsolutePath,
  type PathFragment,
  type RelativePath,
} from "../../path/customTypes/index.js";
import { createFolderWithContentsSchema, type FolderWithContents } from "./folderWithContents.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesUnitTestWorkspaceFolder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "unit-test-workspace"),
);

const directoryDirentFlagsPattern: DirentFlagPatterns = {
  isDirectory: true,
  isFile: false,
  isSymlink: false,
};

const fileDirentFlagsPattern: DirentFlagPatterns = {
  isDirectory: false,
  isFile: true,
  isSymlink: false,
};

const testCasesForCreateFolderWithContentsSchema = [
  {
    testInput: {
      data: {
        folderWithContentsSchema: {
          pathDetection: "checkStaticEntries",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription: "whitelist input with existing folders",
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
      data: {
        folderWithContentsSchema: {
          pathDetection: "checkStaticEntries",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("workflows2"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription: "whitelist input with non-existing folders",
    },
    testOutcome: {
      testBehaviourDescription: "should fail",
      data: {
        result: false,
      },
    },
  },
  {
    testInput: {
      data: {
        folderWithContentsSchema: {
          failOnExtraItems: false,
          pathDetection: "readDir",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription:
        'existing patterns partially matching input retrieved through fs.readdir + "failOnExtraItems": false',
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
      data: {
        folderWithContentsSchema: {
          failOnExtraItems: false,
          pathDetection: "readDir",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("workflows2"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription:
        'non-existing patterns and input retrieved through fs.readdir + "failOnExtraItems": false',
    },
    testOutcome: {
      testBehaviourDescription: "should fail",
      data: {
        result: false,
      },
    },
  },
  {
    testInput: {
      data: {
        folderWithContentsSchema: {
          failOnExtraItems: true,
          pathDetection: "readDir",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("workflows"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("workflow-presets"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription:
        'existing patterns fully matching input retrieved through fs.readdir + "failOnExtraItems": true',
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
      data: {
        folderWithContentsSchema: {
          failOnExtraItems: true,
          pathDetection: "readDir",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("workflows"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription:
        'patterns partially matching input retrieved through fs.readdir + "failOnExtraItems": true',
    },
    testOutcome: {
      testBehaviourDescription: "should fail",
      data: {
        result: false,
      },
    },
  },
  {
    testInput: {
      data: {
        folderWithContentsSchema: {
          failOnExtraItems: false,
          pathDetection: "readDirRecursive",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription:
        'existing patterns partially matching input retrieved through fs.readdir + "failOnExtraItems": false',
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
      data: {
        folderWithContentsSchema: {
          failOnExtraItems: false,
          pathDetection: "readDirRecursive",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("workflows2"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription:
        'non-existing patterns and input retrieved through fs.readdir + "failOnExtraItems": false',
    },
    testOutcome: {
      testBehaviourDescription: "should fail",
      data: {
        result: false,
      },
    },
  },
  {
    testInput: {
      data: {
        folderWithContentsSchema: {
          failOnExtraItems: true,
          pathDetection: "readDirRecursive",
          items: new Map<RelativePath, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [RelativePathSchema.parse("templates/test-template-basic.hbs"), fileDirentFlagsPattern],
            [
              RelativePathSchema.parse("templates/test-template-basic-if-statement.hbs"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("templates/test-template-with-each-block.hbs"),
              fileDirentFlagsPattern,
            ],
            [RelativePathSchema.parse("templates/test-bad-syntax.hbs"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("templates/.oxfmtrc.jsonc"), fileDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
            [RelativePathSchema.parse("terms/test-term.yml"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("terms/test-term.json"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("terms/test-term.txt"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("terms/test-term-bad-syntax.json"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("terms/test-term-bad-syntax.yml"), fileDirentFlagsPattern],
            [
              RelativePathSchema.parse("terms/test-term-bad-nested-syntax.json"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("terms/test-term-bad-nested-syntax.yml"),
              fileDirentFlagsPattern,
            ],
            [RelativePathSchema.parse("terms/test-term-nested.yml"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("terms/test-term-nested.json"), fileDirentFlagsPattern],
            [
              RelativePathSchema.parse("terms/plaintext-parser-test-fixture-1--normal-file.txt"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse(
                "terms/plaintext-parser-test-fixture-2--file-with-lines-containing-whitespaces.txt",
              ),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse(
                "terms/plaintext-parser-test-fixture-3--file-with-empty-line-in-middle.txt",
              ),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse(
                "terms/plaintext-parser-test-fixture-4--file-with-whitespace-line-in-middle.txt",
              ),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse(
                "terms/plaintext-parser-test-fixture-5--file-with-trailing-empty-line.txt",
              ),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse(
                "terms/plaintext-parser-test-fixture-6--file-with-trailing-whitespace-line.txt",
              ),
              fileDirentFlagsPattern,
            ],
            [PathFragmentSchema.parse("workflows"), directoryDirentFlagsPattern],
            [RelativePathSchema.parse("workflows/test-workflow.yml"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("workflows/test-workflow.json"), fileDirentFlagsPattern],
            [
              RelativePathSchema.parse("workflows/test-workflow-bad-syntax.yml"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("workflows/test-workflow-bad-syntax.json"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("workflows/test-workflow-bad-template-syntax.yml"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("workflows/test-workflow-bad-template-syntax.json"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse(
                "workflows/test-workflow-for-template-with-basic-if-statement.yml",
              ),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse(
                "workflows/test-workflow-for-template-with-basic-if-statement.json",
              ),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("workflows/test-workflow-for-template-with-each-block.yml"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("workflows/test-workflow-for-template-with-each-block.json"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("workflows/test-workflow-with-term-reference.yml"),
              fileDirentFlagsPattern,
            ],
            [
              RelativePathSchema.parse("workflows/test-workflow-with-term-reference.json"),
              fileDirentFlagsPattern,
            ],
            [PathFragmentSchema.parse("workflow-presets"), directoryDirentFlagsPattern],
            [
              RelativePathSchema.parse("workflow-presets/test-workflow-preset.yml"),
              fileDirentFlagsPattern,
            ],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription:
        'existing patterns fully matching input retrieved through fs.readdir + "failOnExtraItems": true',
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
      data: {
        folderWithContentsSchema: {
          failOnExtraItems: true,
          pathDetection: "readDirRecursive",
          items: new Map<PathFragment, DirentFlagPatterns>([
            [PathFragmentSchema.parse("templates"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("workflows"), directoryDirentFlagsPattern],
          ]),
        },
        rootFolder: fixturesUnitTestWorkspaceFolder,
      },
      testCaseDescription:
        'patterns partially matching input retrieved through fs.readdir + "failOnExtraItems": true',
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
    data: {
      folderWithContentsSchema: Parameters<typeof createFolderWithContentsSchema>[0];
      rootFolder: AbsolutePath;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("createFolderWithContentsSchema", () => {
  for (const { testInput, testOutcome } of testCasesForCreateFolderWithContentsSchema) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const FolderWithContentsSchema = createFolderWithContentsSchema(
        testInput.data.folderWithContentsSchema,
      );
      const parsingResult = await FolderWithContentsSchema.safeParseAsync(
        testInput.data.rootFolder,
      );
      expect(parsingResult.success).toBe(testOutcome.data.result);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<FolderWithContents>();
      }
    });
  }
});
