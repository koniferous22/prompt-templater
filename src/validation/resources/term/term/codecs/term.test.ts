import { describe, expect, it } from "bun:test";

import { expectTypeOf } from "expect-type";
import z from "zod";

import type { TermData } from "../factories/termByTermType.js";
import {
  BooleanTermFromBooleanArraySchema,
  NumericTermFromNumericArraySchema,
  StringTermFromStringArraySchema,
  BooleanTermFromBooleanRecordSchema,
  NumericTermFromNumericRecordSchema,
  StringTermFromStringRecordSchema,
} from "./term.js";

const testCasesForBooleanTermFromBooleanArraySchema = [
  {
    testInput: {
      data: [true, false],
      testCaseDescription: "valid non-empty boolean array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: [],
      testCaseDescription: "empty array",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof BooleanTermFromBooleanArraySchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("BooleanTermFromBooleanArraySchema", () => {
  for (const { testInput, testOutcome } of testCasesForBooleanTermFromBooleanArraySchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = BooleanTermFromBooleanArraySchema.safeParse(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"boolean">>();
      }
    });
  }
});

const testCasesForNumericTermFromNumericArraySchema = [
  {
    testInput: {
      data: [3, 5],
      testCaseDescription: "valid non-empty numeric array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: [],
      testCaseDescription: "empty array",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof NumericTermFromNumericArraySchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("NumericTermFromNumericArraySchema", () => {
  for (const { testInput, testOutcome } of testCasesForNumericTermFromNumericArraySchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = NumericTermFromNumericArraySchema.safeParse(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"number">>();
      }
    });
  }
});

const testCasesForStringTermFromStringArraySchema = [
  {
    testInput: {
      data: ["string1", "string2"],
      testCaseDescription: "valid non-empty string array",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: [],
      testCaseDescription: "empty array",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof StringTermFromStringArraySchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("StringTermFromStringArraySchema", () => {
  for (const { testInput, testOutcome } of testCasesForStringTermFromStringArraySchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = StringTermFromStringArraySchema.safeParse(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"string">>();
      }
    });
  }
});

const testCasesForBooleanTermFromBooleanRecordSchema = [
  {
    testInput: {
      data: { true: "true label", false: "false label" },
      testCaseDescription: "valid non-empty record with boolean keys",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {},
      testCaseDescription: "empty record",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof BooleanTermFromBooleanRecordSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("BooleanTermFromBooleanRecordSchema", () => {
  for (const { testInput, testOutcome } of testCasesForBooleanTermFromBooleanRecordSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = BooleanTermFromBooleanRecordSchema.safeParse(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"boolean">>();
      }
    });
  }
});

const testCasesForNumericTermFromNumericRecordSchema = [
  {
    testInput: {
      data: { 3: "label for 3", 5: "label for 5" },
      testCaseDescription: "valid non-empty record with numeric keys",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {},
      testCaseDescription: "empty record",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof NumericTermFromNumericRecordSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("NumericTermFromNumericRecordSchema", () => {
  for (const { testInput, testOutcome } of testCasesForNumericTermFromNumericRecordSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = NumericTermFromNumericRecordSchema.safeParse(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"number">>();
      }
    });
  }
});

const testCasesForStringTermFromStringRecordSchema = [
  {
    testInput: {
      data: { string1: "string1", string2: "string2 label with extra text" },
      testCaseDescription: "valid non-empty record with string keys",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {},
      testCaseDescription: "empty record",
    },
    testOutcome: {
      data: false,
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof StringTermFromStringRecordSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("StringTermFromStringRecordSchema", () => {
  for (const { testInput, testOutcome } of testCasesForStringTermFromStringRecordSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = StringTermFromStringRecordSchema.safeParse(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermData<"string">>();
      }
    });
  }
});
