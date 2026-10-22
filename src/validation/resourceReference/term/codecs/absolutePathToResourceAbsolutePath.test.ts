import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";

import { type AbsolutePath, AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  type TermResourceAbsolutePath,
  TermResourceAbsolutePathSchema,
} from "../schemas/termResourceAbsolutePath.js";
import { AbsolutePathToTermResourceAbsolutePath } from "./absolutePathToResourceAbsolutePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const fixturesWorkspace1Folder = AbsolutePathSchema.parse(
  join(projectFixturesFolder, "workspace1"),
);
const testCasesForTermResourceFileFromReference = [
  {
    testInput: {
      data: AbsolutePathSchema.parse(join(fixturesWorkspace1Folder, "terms/test-term.json")),
      testCaseDescription: "absolute path with .json term extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceAbsolutePathSchema.parse({
          format: "json",
          path: join(fixturesWorkspace1Folder, "terms/test-term.json"),
          selector: [],
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: AbsolutePathSchema.parse(join(fixturesWorkspace1Folder, "terms/test-term.yml")),
      testCaseDescription: "absolute path with .yml term extension",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceAbsolutePathSchema.parse({
          format: "yaml",
          path: join(fixturesWorkspace1Folder, "terms/test-term.yml"),
          selector: [],
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: AbsolutePathSchema.parse(join(fixturesWorkspace1Folder, "terms/test-term.txt")),
      testCaseDescription: "absolute path with plaintext as fallback",
    },
    testOutcome: {
      data: {
        result: true,
        value: TermResourceAbsolutePathSchema.parse({
          format: "plaintext",
          path: join(fixturesWorkspace1Folder, "terms/test-term.txt"),
        }),
      },
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
] satisfies {
  testInput: {
    data: AbsolutePath;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: true;
      value: TermResourceAbsolutePath;
    };
    testBehaviourDescription: string;
  };
}[];

describe("AbsolutePathToTermResourceAbsolutePath", () => {
  for (const { testInput, testOutcome } of testCasesForTermResourceFileFromReference) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = AbsolutePathToTermResourceAbsolutePath.safeParse(testInput.data);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        assert.deepEqual(parsingResult.data, testOutcome.data.value);
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermResourceAbsolutePath>();
      }
    });
  }
});
