import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { expectTypeOf } from "expect-type";

import { type RelativePath, RelativePathSchema } from "../../../path/customTypes/index.js";
import {
  type TermResourceRelativePath,
  TermResourceRelativePathSchema,
} from "../schemas/termResourceRelativePath.js";
import { RelativePathToTermResourceRelativePath } from "./relativePathToResourceRelativePath.js";

const testCasesForTermResourceFileFromReference = [
  {
    testInput: {
      data: RelativePathSchema.parse("terms/test-term.json"),
      testCaseDescription: "relative path with .json term extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceRelativePathSchema.parse({
          format: "json",
          path: "terms/test-term.json",
          selector: null,
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
  {
    testInput: {
      data: RelativePathSchema.parse("terms/test-term.yml"),
      testCaseDescription: "relative path with .yml term extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceRelativePathSchema.parse({
          format: "yaml",
          path: "terms/test-term.yml",
          selector: null,
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
  {
    testInput: {
      data: RelativePathSchema.parse("terms/test-term.txt"),
      testCaseDescription: "relative path with plaintext as fallback",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceRelativePathSchema.parse({
          format: "plaintext",
          path: "terms/test-term.txt",
          options: {
            whitespaceLines: "skipTrailing",
            trimWhitespace: true,
            strict: false,
          },
        }),
      },
      testBehaviourDescription: "succeed with original relative path",
    },
  },
] satisfies {
  testInput: {
    data: RelativePath;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: true;
      value: TermResourceRelativePath;
    };
    testBehaviourDescription: string;
  };
}[];

describe("RelativePathToTermResourceRelativePath", () => {
  for (const { testInput, testOutcome } of testCasesForTermResourceFileFromReference) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = RelativePathToTermResourceRelativePath.safeParse(testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        assert.deepEqual(parsingResult.data, testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermResourceRelativePath>();
      }
    });
  }
});
