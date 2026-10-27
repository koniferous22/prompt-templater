import assert from "node:assert";
import { describe, it } from "node:test";

import { NonEmptyStringSchema } from "../../../../string/customTypes/string.js";
import {
  createTermByTermTypeSchema,
  createTermFromArrayInputByTermTypeCodec,
  createTermFromRecordInputByTermTypeCodec,
  type Term,
  type TermInputArrayValue,
  type TermInputRecordValue,
  type TermValueType,
} from "../factories/termByTermType.js";

type CreateTermTestValidCase<TermType extends TermValueType> = {
  termType: TermType;
  values: Term<TermType>;
};

type CreateTermTestInvalidCase = {
  termType: TermValueType;
  values: Term<TermValueType>;
};

const testCasesForCreateTermByTermTypeSchema = [
  {
    testInput: {
      data: {
        termType: "string",
        values: [
          {
            value: NonEmptyStringSchema.parse("string1"),
            label: NonEmptyStringSchema.parse("label for string1"),
          },
          {
            value: NonEmptyStringSchema.parse("string2"),
            label: NonEmptyStringSchema.parse("label for string2"),
          },
        ],
      },
      testCaseDescription: "valid non-empty input array with values of correct type",
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
        values: [
          {
            value: true,
            label: NonEmptyStringSchema.parse("label for true"),
          },
        ],
      },
      testCaseDescription: "invalid non-empty array with values of incorrect type",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: CreateTermTestValidCase<"string"> | CreateTermTestInvalidCase;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("createTermByTermTypeSchema", () => {
  for (const { testInput, testOutcome } of testCasesForCreateTermByTermTypeSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const TermSchema = createTermByTermTypeSchema(testInput.data.termType);
      const parsingResult = TermSchema.safeParse(testInput.data.values);
      assert.strictEqual(parsingResult.success, testOutcome.data);
    });
  }
});

type CreateTermFromArrayTestValidCase<TermType extends TermValueType> = {
  termType: TermType;
  values: TermInputArrayValue<TermType>;
};

type CreateTermFromArrayTestInvalidCase = {
  termType: TermValueType;
  values: TermInputArrayValue<TermValueType>;
};

const testCasesForCreateTermFromArrayInputByTermTypeCodec = [
  {
    testInput: {
      data: {
        termType: "string",
        values: ["string1", "string2"],
      },
      testCaseDescription: "valid non-empty input array with values of correct type",
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
        values: [true],
      },
      testCaseDescription: "invalid non-empty array with values of incorrect type",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: CreateTermFromArrayTestValidCase<"string"> | CreateTermFromArrayTestInvalidCase;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("createTermFromArrayInputByTermTypeCodec", () => {
  for (const { testInput, testOutcome } of testCasesForCreateTermFromArrayInputByTermTypeCodec) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const TermFromArrayInputSchema = createTermFromArrayInputByTermTypeCodec(
        testInput.data.termType,
      );
      const parsingResult = TermFromArrayInputSchema.safeParse(testInput.data.values);
      assert.strictEqual(parsingResult.success, testOutcome.data);
    });
  }
});

type CreateTermFromRecordTestValidCase<TermType extends TermValueType> = {
  termType: TermType;
  values: TermInputRecordValue<TermType>;
};

type CreateTermFromRecordTestInvalidCase = {
  termType: TermValueType;
  values: TermInputRecordValue<TermValueType>;
};

const testCasesForCreateTermFromRecordInputByTermTypeCodec = [
  {
    testInput: {
      data: {
        termType: "string",
        values: {
          string1: "label for string1",
          string2: "label for string2",
        },
      },
      testCaseDescription: "valid non-empty input array with values of correct type",
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
        values: {
          notABoolean: "label for notABoolean",
        },
      },
      testCaseDescription: "invalid non-empty array with values of incorrect type",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: CreateTermFromRecordTestValidCase<"string"> | CreateTermFromRecordTestInvalidCase;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("createTermFromRecordInputByTermTypeCodec", () => {
  for (const { testInput, testOutcome } of testCasesForCreateTermFromRecordInputByTermTypeCodec) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const TermFromRecordInputSchema = createTermFromRecordInputByTermTypeCodec(
        testInput.data.termType,
      );
      const parsingResult = TermFromRecordInputSchema.safeParse(testInput.data.values);
      assert.strictEqual(parsingResult.success, testOutcome.data);
    });
  }
});
