import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import { FileExtensionSchema, type FileExtension } from "../customTypes/fileExtension.js";
import {
  AbsolutePathSchema,
  RelativePathSchema,
  type AbsolutePath,
  type RelativePath,
} from "../customTypes/index.js";
import {
  createAbsolutePathWithExtensionSchema,
  createRelativePathWithExtensionSchema,
  type AbsolutePathWithExtension,
  type RelativePathWithExtension,
} from "./pathWithExtension.js";

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
      const parsingResult = AbsolutePathWithExtensionSchema.safeParse(testInput.data.file);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<AbsolutePathWithExtension>();
      }
    });
  }
});

const testCasesForCreateRelativePathWithExtensionSchema = [
  {
    testInput: {
      data: {
        file: RelativePathSchema.parse("workflows/test-workflow.yml"),
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
        file: RelativePathSchema.parse("workflows/test-workflow.yml"),
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
      file: RelativePath;
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

describe("createRelativePathWithExtensionSchema", () => {
  for (const { testInput, testOutcome } of testCasesForCreateRelativePathWithExtensionSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const RelativePathWithExtensionSchema = createRelativePathWithExtensionSchema(
        testInput.data.extension,
      );
      const parsingResult = RelativePathWithExtensionSchema.safeParse(testInput.data.file);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<RelativePathWithExtension>();
      }
    });
  }
});
