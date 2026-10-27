import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import type { TermValueType } from "../../../../validation/resources/term/term/factories/termByTermType.js";
import { termResourceFactories, type termSchemasByTermType } from "./resourceFactories.js";

type CreateTermInput<TermType extends TermValueType> = {
  termType: TermType;
  inputData: z.input<(typeof termSchemasByTermType)[TermType]>;
};

const testCasesCreateTerm = [
  {
    testInput: {
      data: {
        termType: "boolean",
        inputData: [true, false],
      },
      testCaseDescription: "valid non-empty boolean array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        termType: "boolean",
        inputData: { true: "label for true", false: "label for false" },
      },
      testCaseDescription: "valid non-empty boolean record",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        termType: "number",
        inputData: [3, 5],
      },
      testCaseDescription: "valid non-empty numeric array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        termType: "number",
        inputData: { 3: "label for 3", 5: "label for 5" },
      },
      testCaseDescription: "valid non-empty numeric array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        termType: "string",
        inputData: ["string1", "string2"],
      },
      testCaseDescription: "valid non-empty string array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        termType: "string",
        inputData: { string1: "label for string1", string2: "label for string2" },
      },
      testCaseDescription: "valid non-empty string array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: CreateTermInput<"boolean"> | CreateTermInput<"number"> | CreateTermInput<"string">;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("termFactories.term", () => {
  for (const { testInput, testOutcome } of testCasesCreateTerm) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const result = termResourceFactories.term(testInput.data.termType, testInput.data.inputData, {
        file: AbsolutePathSchema.parse("/example/absolute/path"),
      });
      assert.strictEqual(result.isOk(), testOutcome.data);
    });
  }
});
