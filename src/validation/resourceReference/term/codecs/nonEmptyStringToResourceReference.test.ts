import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import { NonEmptyStringSchema, type NonEmptyString } from "../../../string/customTypes/string.js";
import {
  TermResourceReferenceSchema,
  type TermResourceReference,
} from "../schemas/termResourceReference.js";
import { NonEmptyStringToTermResourceReferenceSchema } from "./nonEmptyStringToResourceReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesWorkspace1Folder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "workspace1"),
);
const testCasesForNonEmptyStringToTermResourceReferenceSchema = [
  {
    testInput: {
      data: NonEmptyStringSchema.parse(join(fixturesWorkspace1Folder, "terms/test-term.json")),
      testCaseDescription: "absolute path with .json term extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "json",
            path: join(fixturesWorkspace1Folder, "terms/test-term.json"),
            selector: null,
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse(join(fixturesWorkspace1Folder, "terms/test-term.yml")),
      testCaseDescription: "absolute path with .yml term extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "yaml",
            path: join(fixturesWorkspace1Folder, "terms/test-term.yml"),
            selector: null,
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse(join(fixturesWorkspace1Folder, "terms/test-term.txt")),
      testCaseDescription: "absolute path with plaintext as fallback",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "plaintext",
            path: join(fixturesWorkspace1Folder, "terms/test-term.txt"),
            options: {
              whitespaceLines: "skipTrailing",
              trimWhitespace: true,
              strict: false,
            },
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("terms/test-term.json"),
      testCaseDescription: "absolute path with .json term extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "terms/test-term.json",
            selector: null,
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("terms/test-term.yml"),
      testCaseDescription: "absolute path with .yml term extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "yaml",
            path: "terms/test-term.yml",
            selector: null,
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: NonEmptyStringSchema.parse("terms/test-term.txt"),
      testCaseDescription: "absolute path with plaintext as fallback",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "plaintext",
            path: "terms/test-term.txt",
            options: {
              whitespaceLines: "skipTrailing",
              trimWhitespace: true,
              strict: false,
            },
          },
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
] satisfies {
  testInput: {
    data: NonEmptyString;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: true;
      value: TermResourceReference;
    };
    testBehaviourDescription: string;
  };
}[];

describe("NonEmptyStringToTermResourceReferenceSchema", () => {
  for (const {
    testInput,
    testOutcome,
  } of testCasesForNonEmptyStringToTermResourceReferenceSchema) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = NonEmptyStringToTermResourceReferenceSchema.safeParse(testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        assert.deepEqual(parsingResult.data, testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermResourceReference>();
      }
    });
  }
});
