import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import { RelativePathSchema } from "../../path/customTypes/platformSpecific/posix/path.js";
import { DirentSchema, type Dirent } from "../schemas/dirent.js";
import { DirentObjectToDirentSchema } from "./direntObjectToDirent.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));

const testCasesForDirentObjectToDirentSchema = [
  {
    testInput: {
      data: {
        initializeDirents: () => {
          const result = new fs.Dirent(
            // @ts-expect-error
            "package.json",
            // note - constant from `libuv` - "UV_DIRENT_FILE"
            1,
          );
          result.parentPath = projectRoot;
          return result;
        },
      },
      testCaseDescription: "dirent object matching file",
    },
    testOutcome: {
      data: {
        result: true,
        dirent: DirentSchema.parse({
          parentPath: projectRoot,
          name: RelativePathSchema.parse("package.json"),
          direntFlags: {
            isDirectory: false,
            isFile: true,
            isSymlink: false,
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        initializeDirents: () => {
          const result = new fs.Dirent(
            // @ts-expect-error
            "fixtures",
            // note - constant from `libuv` - "UV_DIRENT_DIR"
            2,
          );
          result.parentPath = projectRoot;
          return result;
        },
      },
      testCaseDescription: "dirent object matching file",
    },
    testOutcome: {
      data: {
        result: true,
        dirent: DirentSchema.parse({
          parentPath: projectRoot,
          name: RelativePathSchema.parse("fixtures"),
          direntFlags: {
            isDirectory: true,
            isFile: false,
            isSymlink: false,
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
] satisfies {
  testInput: {
    data: {
      initializeDirents: () => fs.Dirent | Promise<fs.Dirent>;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
          dirent: Dirent;
        }
      | {
          result: false;
        };
    testBehaviourDescription: string;
  };
}[];

describe("DirentObjectToDirentSchema", () => {
  for (const { testInput, testOutcome } of testCasesForDirentObjectToDirentSchema) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const fixture = await testInput.data.initializeDirents();
      const parsingResult = DirentObjectToDirentSchema.safeParse(fixture);
      expect(parsingResult.success).toBe(testOutcome.data.result);
      if (parsingResult.success) {
        expect(parsingResult.data.dirent).toEqual(testOutcome.data.dirent);
        // Assert coded revertbility - that codec contains unmodified reference to original object used in input
        expect(parsingResult.data.direntObject).toBe(fixture);
      }
    });
  }
});
