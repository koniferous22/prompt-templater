import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  TermResourceAbsolutePathSchema,
  type TermResourceAbsolutePath,
} from "../../../resourceReference/term/schemas/termResourceAbsolutePath.js";
import {
  TermResourceFileSchema,
  type TermResourceFile,
} from "./resourceAbsolutePathToResourceFile.js";
import { PlainFileTermReferenceOptionsInputSchema } from "../../../resourceReference/term/schemas/plainFileReferenceOptions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForTermResourceFileSchema = [
  {
    testInput: {
      data: TermResourceAbsolutePathSchema.parse({
        format: "yaml",
        path: AbsolutePathSchema.parse(
          join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.yml"),
        ),
        selector: null,
      }),
      testCaseDescription: "yaml term resource path pointing to existing file",
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
      data: TermResourceAbsolutePathSchema.parse({
        format: "json",
        path: AbsolutePathSchema.parse(
          join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.json"),
        ),
        selector: null,
      }),
      testCaseDescription: "json term resource path pointing to existing file",
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
      data: TermResourceAbsolutePathSchema.parse({
        format: "plaintext",
        path: AbsolutePathSchema.parse(
          join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.txt"),
        ),
        options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
      }),
      testCaseDescription: "plaintext term resource path pointing to existing file",
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
      data: TermResourceAbsolutePathSchema.parse({
        format: "yaml",
        path: AbsolutePathSchema.parse(
          join(
            __dirname,
            "../../../../../fixtures/non-existing-workspace/terms/test-term.yml",
          ),
        ),
        selector: null,
      }),
      testCaseDescription: "yaml term resource path pointing to non-existing file",
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
      data: TermResourceAbsolutePathSchema.parse({
        format: "json",
        path: AbsolutePathSchema.parse(
          join(
            __dirname,
            "../../../../../fixtures/non-existing-workspace/terms/test-term.json",
          ),
        ),
        selector: null,
      }),
      testCaseDescription: "json term resource path pointing to non-existing file",
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
      data: TermResourceAbsolutePathSchema.parse({
        format: "plaintext",
        path: AbsolutePathSchema.parse(
          join(
            __dirname,
            "../../../../../fixtures/non-existing-workspace/terms/test-term.txt",
          ),
        ),
        options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
      }),
      testCaseDescription: "plaintext term resource path pointing to non-existing file",
    },
    testOutcome: {
      testBehaviourDescription: "should fail",
      data: {
        result: false,
      },
    },
  }
] satisfies {
  testInput: {
    data: TermResourceAbsolutePath;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("TermResourceFileSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTermResourceFileSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = await TermResourceFileSchema.safeParseAsync(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermResourceFile>();
      }
    });
  }
});

