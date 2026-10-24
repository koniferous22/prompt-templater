import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { ChoicesSchema } from "./choices.js";

const testCasesForChoicesSchema = [
  {
    testInput: {
      data: {
        type: "literalValues",
        values: {
          type: "literal",
          format: "array",
          valueType: "boolean",
          values: [true, false],
        },
      },
      testCaseDescription: "literalValues with boolean valueType and array of booleans",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "literalValues",
        values: {
          type: "literal",
          format: "array",
          valueType: "number",
          values: [1, 2.5, -3],
        },
      },
      testCaseDescription: "literalValues with number valueType and array of numbers",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "literalValues",
        values: {
          type: "literal",
          format: "array",
          valueType: "string",
          values: ["foo", "bar"],
        },
      },
      testCaseDescription: "literalValues with string valueType and array of non-empty strings",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "literalValues",
        values: {
          type: "literal",
          format: "record",
          valueType: "boolean",
          values: {
            true: "label for true",
            false: "label for false",
          },
        },
      },
      testCaseDescription: "literalValues with boolean valueType and array of booleans",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "literalValues",
        values: {
          type: "literal",
          format: "record",
          valueType: "number",
          values: {
            1: "label for 1",
            2.5: "label for 2.5",
            [-3]: "label for -3",
          },
        },
      },
      testCaseDescription: "literalValues with number valueType and array of numbers",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "literalValues",
        values: {
          type: "literal",
          format: "record",
          valueType: "string",
          values: {
            foo: "label for foo",
            bar: "label for bar",
          },
        },
      },
      testCaseDescription: "literalValues with string valueType and array of non-empty strings",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "reference",
        reference: {
          type: "absolute",
          filePath: {
            format: "plaintext",
            path: "/absolute/posix/path",
            options: {
              emptyLines: "allowTrailing",
              trimWhitespace: true,
            },
          },
        },
      },
      testCaseDescription: "reference with absolute plaintext TermResourceAbsolutePath",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "reference",
        reference: {
          type: "absolute",
          filePath: {
            format: "json",
            path: "/absolute/posix/path.json",
            selector: null,
          },
        },
      },
      testCaseDescription:
        "reference with absolute json TermResourceAbsolutePath and null selector",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "reference",
        reference: {
          type: "absolute",
          filePath: {
            format: "yaml",
            path: "/absolute/posix/path.yaml",
            selector: ["key", 0],
          },
        },
      },
      testCaseDescription:
        "reference with absolute yaml TermResourceAbsolutePath and non-null selector array",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "reference",
        reference: {
          type: "relative",
          filePath: {
            format: "plaintext",
            path: "relative/posix/path",
            options: {
              emptyLines: "allowTrailing",
              trimWhitespace: true,
            },
          },
        },
      },
      testCaseDescription: "reference with relative plaintext TermResourceRelativePath",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "reference",
        reference: {
          type: "relative",
          filePath: {
            format: "json",
            path: "relative/posix/path.json",
            selector: null,
          },
        },
      },
      testCaseDescription:
        "reference with relative json TermResourceRelativePath and null selector",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
  {
    testInput: {
      data: {
        type: "reference",
        reference: {
          type: "relative",
          filePath: {
            format: "yaml",
            path: "relative/posix/path.yaml",
            selector: ["nested", 1],
          },
        },
      },
      testCaseDescription:
        "reference with relative yaml TermResourceRelativePath and non-null selector array",
    },
    testOutcome: {
      testBehaviourDescription: "succeed",
      data: {
        result: true,
      },
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof ChoicesSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("ChoicesSchema", () => {
  for (const { testInput, testOutcome } of testCasesForChoicesSchema) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = ChoicesSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
