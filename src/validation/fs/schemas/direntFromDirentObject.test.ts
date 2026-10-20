import assert from "node:assert/strict";
import fs from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import { RelativePathSchema } from "../../path/customTypes/platformSpecific/posix/path.js";
import { DirentSchema, type Dirent } from "../schemas/dirent.js";
import { DirentFromDirentObjectSchema } from "./direntFromDirentObject.js";


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
      const parsingResult = DirentFromDirentObjectSchema.safeParse(fixture);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (parsingResult.success) {
        assert.deepEqual(parsingResult.data, testOutcome.data.dirent);
      }
    });
  }
});
