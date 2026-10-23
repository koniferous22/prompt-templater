import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { ChoicesInputSchema } from "./choicesInput.js";

const testCasesForChoicesInputSchema = [
  {
    testInput: {
      data: "/absolute/path/to/term.json",
      testCaseDescription: "reference string denoting absolute .json path",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: "/absolute/path/to/term.yml",
      testCaseDescription: "reference string denoting absolute .yml path",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: "/absolute/path/to/term.txt",
      testCaseDescription: "reference string denoting absolute plaintext path",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: "path/to/term.json",
      testCaseDescription: "reference string denoting relative .json path",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: "path/to/term.yml",
      testCaseDescription: "reference string denoting relative .yml path",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: "path/to/term.txt",
      testCaseDescription: "reference string denoting relative plaintext path",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: true,
      testCaseDescription: "single boolean literal (converted to array)",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: [true, false],
      testCaseDescription: "array of boolean literals",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: 1,
      testCaseDescription: "single number literal (converted to array)",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: [1, 2],
      testCaseDescription: "array of number literals",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: "string1",
      testCaseDescription: "single string literal (converted to array)",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: ["string1", "string2"],
      testCaseDescription: "array of string literals",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        true: "label1",
        false: "label2",
      },
      testCaseDescription: "record with boolean literals",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        1: "label1",
        2: "label2",
      },
      testCaseDescription: "record with number literals",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        value1: "label1",
        value2: "label2",
      },
      testCaseDescription: "record with string literals",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "jsonFile",
        file: "path/to/term.json",
        selector: null,
      },
      testCaseDescription: "full choices object with selectors",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "jsonFile",
        file: "path/to/term.json",
        selector: [1, "objectKey"],
      },
      testCaseDescription: "full choices object with selectors",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof ChoicesInputSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("ChoicesInputSchema", () => {
  for (const { testInput, testOutcome } of testCasesForChoicesInputSchema) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = ChoicesInputSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
