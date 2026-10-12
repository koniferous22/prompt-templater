import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { FileSchema, type File } from "../../validation/schemas/file.js";
import { FileExtensionSchema, type FileExtension } from "../customTypes/fileExtension.js";
import { createFileWithExtensionSchema } from "./fileWithExtension.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cases

const testCasesForCreateFileWithExtensionSchema = [
  {
    testInput: {
      data: {
        file: await FileSchema.parseAsync(
          join(__dirname, "../../../fixtures/workspace1/workflows/test-workflow.yml"),
        ),
        extension: FileExtensionSchema.parse("yml"),
      },
      testCaseDescription: 'existing .yml file with expected "yml" extension',
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
        file: await FileSchema.parseAsync(
          join(__dirname, "../../../fixtures/workspace1/workflows/test-workflow.yml"),
        ),
        extension: FileExtensionSchema.parse("json"),
      },
      testCaseDescription: 'existing .yml file with expected "json" extension',
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
      file: File;
      extension: FileExtension;
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

describe("createFileWithExtensionSchema", () => {
  for (const { testInput, testOutcome } of testCasesForCreateFileWithExtensionSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const FileWithExtensionSchema = createFileWithExtensionSchema(testInput.data.extension);
      const fileWithExtensionResult = await FileWithExtensionSchema.safeParseAsync(
        testInput.data.file,
      );
      assert.strictEqual(fileWithExtensionResult.success, testOutcome.data.result);
    });
  }
});
