import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { FileExtensionSchema, type FileExtension } from "../customTypes/fileExtension.js";
import { AbsolutePathSchema, type AbsolutePath } from "../customTypes/index.js";
import { createAbsolutePathWithExtensionSchema } from "./pathWithExtension.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForCreateAbsolutePathWithExtensionSchema = [
  {
    testInput: {
      data: {
        file: AbsolutePathSchema.parse(
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
        file: AbsolutePathSchema.parse(
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
      file: AbsolutePath;
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

describe("createAbsolutePathWithExtensionSchema", () => {
  for (const { testInput, testOutcome } of testCasesForCreateAbsolutePathWithExtensionSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const AbsolutePathWithExtensionSchema = createAbsolutePathWithExtensionSchema(
        testInput.data.extension,
      );
      const AbsolutePathWithExtensionResult = AbsolutePathWithExtensionSchema.safeParse(
        testInput.data.file,
      );
      assert.strictEqual(AbsolutePathWithExtensionResult.success, testOutcome.data.result);
    });
  }
});
