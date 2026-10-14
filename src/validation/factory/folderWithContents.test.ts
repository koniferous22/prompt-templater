import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { DirentFlagPatterns } from "../../modules/direntFlagsMatcher/direntFlagsMatcher.js";
import {
  AbsolutePathSchema,
  PathFragmentSchema,
  RelativePathSchema,
  type AbsolutePath,
  type PathFragment,
  type RelativePath,
} from "../customTypes/path.js";
import { createFolderWithContentsSchema } from "./folderWithContents.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesWorkspace1Folder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "workspace1"),
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
        rootFolder: fixturesWorkspace1Folder,
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
        rootFolder: fixturesWorkspace1Folder,
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
        rootFolder: fixturesWorkspace1Folder,
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
        rootFolder: fixturesWorkspace1Folder,
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
        rootFolder: fixturesWorkspace1Folder,
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
        rootFolder: fixturesWorkspace1Folder,
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
        rootFolder: fixturesWorkspace1Folder,
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
        rootFolder: fixturesWorkspace1Folder,
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
            [RelativePathSchema.parse("templates/test-template.pug"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("templates/test-bad-syntax.pug"), fileDirentFlagsPattern],
            [PathFragmentSchema.parse("terms"), directoryDirentFlagsPattern],
            [PathFragmentSchema.parse("workflows"), directoryDirentFlagsPattern],
            [RelativePathSchema.parse("workflows/test-workflow.yml"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("workflows/test-workflow.json"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("workflows/test-bad-syntax.yml"), fileDirentFlagsPattern],
            [RelativePathSchema.parse("workflows/test-bad-syntax.json"), fileDirentFlagsPattern],
            [PathFragmentSchema.parse("workflow-presets"), directoryDirentFlagsPattern],
            [
              RelativePathSchema.parse("workflow-presets/test-workflow-preset.yml"),
              fileDirentFlagsPattern,
            ],
          ]),
        },
        rootFolder: fixturesWorkspace1Folder,
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
        rootFolder: fixturesWorkspace1Folder,
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
    it(`for "${testInput.testCaseDescription}" parsing should "${testOutcome.testBehaviourDescription}"`, async () => {
      const FolderWithContentsSchema = createFolderWithContentsSchema(
        testInput.data.folderWithContentsSchema,
      );
      const parsingResult = await FolderWithContentsSchema.safeParseAsync(
        testInput.data.rootFolder,
      );
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
