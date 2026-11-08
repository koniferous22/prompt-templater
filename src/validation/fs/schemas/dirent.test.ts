import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import { RelativePathSchema } from "../../path/customTypes/platformSpecific/posix/path.js";
import { DirentSchema, type Dirent } from "../schemas/dirent.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));

const testCasesForDirentSchema = [
  {
    testInput: {
      data: {
        parentPath: projectRoot,
        name: RelativePathSchema.parse("package.json"),
        direntFlags: {
          isDirectory: false,
          isFile: true,
          isSymlink: false,
        },
      },
      testCaseDescription: "dirent object matching file",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof DirentSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: boolean;
    };
    testBehaviourDescription: string;
  };
}[];

describe("DirentSchema", () => {
  for (const { testInput, testOutcome } of testCasesForDirentSchema) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = DirentSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<Dirent>();
      }
    });
  }
});
