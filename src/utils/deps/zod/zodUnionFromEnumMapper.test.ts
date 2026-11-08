import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";

import { z } from "zod";

import { NonEmptyStringSchema } from "../../../validation/string/customTypes/string.js";
import { buildUnionOptionsFromEnumMapper } from "./zodUnionFromEnumMapper.js";

const SingleSchemaMapper = {
  only: z.array(z.number()),
} as const;

const MultiSchemaMapper = {
  number: z.array(z.number()),
  boolean: z.array(z.boolean()),
  string: z.array(NonEmptyStringSchema),
} as const;

const testCasesForBuildUnionOptionsFromEnumMapper = [
  {
    testInput: {
      data: SingleSchemaMapper,
      testCaseDescription: "a mapper with a single schema entry",
    },
    testOutcome: {
      testBehaviourDescription: "return a non-empty array containing exactly that one schema",
      data: [z.array(z.number())] as ReturnType<typeof buildUnionOptionsFromEnumMapper>,
    },
  },
  {
    testInput: {
      data: MultiSchemaMapper,
      testCaseDescription: "a mapper with multiple distinct Zod schemas",
    },
    testOutcome: {
      testBehaviourDescription:
        "return a non-empty array containing every mapped schema (order follows Object.values)",
      data: [
        z.array(z.number()),
        z.array(z.boolean()),
        z.array(NonEmptyStringSchema),
      ] as ReturnType<typeof buildUnionOptionsFromEnumMapper>,
    },
  },
] satisfies {
  testInput: {
    data: Parameters<typeof buildUnionOptionsFromEnumMapper>[0];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: ReturnType<typeof buildUnionOptionsFromEnumMapper>;
  };
}[];

describe("buildUnionOptionsFromEnumMapper", () => {
  for (const { testInput, testOutcome } of testCasesForBuildUnionOptionsFromEnumMapper) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = buildUnionOptionsFromEnumMapper(testInput.data as any);

      expect(result.length).toEqual(testOutcome.data.length);
      assert.ok(result.length >= 1, "result must be a non-empty array");
      const mapperValues = Object.values(testInput.data);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toEqual(mapperValues[i]);
      }
    });
  }
});
