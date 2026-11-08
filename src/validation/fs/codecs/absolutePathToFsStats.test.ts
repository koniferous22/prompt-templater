import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type z from "zod";

import { AbsolutePathToFsStatsSchema } from "./absolutePathToFsStats.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForAbsolutePathToFsStatsSchema = [
  {
    testInput: {
      data: join(__dirname, "../../../../package.json"),
      testCaseDescription: "path pointing to existing file",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should succeed with result containing original path",
    },
  },
  {
    testInput: {
      data: join(__dirname, "../../../../fixtures"),
      testCaseDescription: "path pointing to existing folder",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should succeed with result containing original path",
    },
  },
  {
    testInput: {
      data: "non-existing file",
      testCaseDescription: "non-existing path",
    },
    testOutcome: {
      data: {
        result: false,
      },
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof AbsolutePathToFsStatsSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: boolean;
    };
    testBehaviourDescription: string;
  };
}[];

describe("AbsolutePathToFsStatsSchema", () => {
  for (const { testInput, testOutcome } of testCasesForAbsolutePathToFsStatsSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = await AbsolutePathToFsStatsSchema.safeParseAsync(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data.result);
      if (testOutcome.data.result === true) {
        assert.ok(parsingResult.success);
        expect(parsingResult.data.absolutePath as string).toBe(testInput.data);
      }
    });
  }
});
