import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  TermResourceReferenceSchema,
  type TermResourceReference,
} from "./termResourceReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForTermResourceReferenceSchema = [
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "json",
          path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.json"),
          selector: null,
        },
      },
      testCaseDescription: "valid .json input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "json",
          path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.json"),
          selector: ["key", 0],
        },
      },
      testCaseDescription: "valid .json input with selector",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "yaml",
          path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.yml"),
          selector: null,
        },
      },
      testCaseDescription: "valid .yaml input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "yaml",
          path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.yml"),
          selector: ["key", 0],
        },
      },
      testCaseDescription: "valid .yaml input with selector",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "yaml",
          path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.yml"),
          selector: ["key", 0],
        },
      },
      testCaseDescription: "valid .yaml input with selector",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "absolute",
        filePath: {
          format: "plaintext",
          path: join(__dirname, "../../../../../fixtures/workspace1/terms/test-term.txt"),
          options: {
            whitespaceLines: "skipTrailing",
            trimWhitespace: true,
            strict: false,
          },
        },
      },
      testCaseDescription: "valid plaintext input with explicit options",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "relative",
        filePath: {
          format: "json",
          path: "fixtures/workspace1/terms/test-term.json",
          selector: null,
        },
      },
      testCaseDescription: "valid .json input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "relative",
        filePath: {
          format: "json",
          path: "fixtures/workspace1/terms/test-term.json",
          selector: ["key", 0],
        },
      },
      testCaseDescription: "valid .json input with selector",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "relative",
        filePath: {
          format: "yaml",
          path: "fixtures/workspace1/terms/test-term.yml",
          selector: null,
        },
      },
      testCaseDescription: "valid .yaml input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "relative",
        filePath: {
          format: "yaml",
          path: "fixtures/workspace1/terms/test-term.yml",
          selector: ["key", 0],
        },
      },
      testCaseDescription: "valid .yaml input with selector",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        type: "relative",
        filePath: {
          format: "plaintext",
          path: "fixtures/workspace1/terms/test-term.txt",
          options: {
            whitespaceLines: "skipTrailing",
            trimWhitespace: true,
            strict: false,
          },
        },
      },
      testCaseDescription: "valid plaintext input",
    },
    testOutcome: {
      data: true,
      testBehaviourDescription: "should succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof TermResourceReferenceSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: boolean;
    testBehaviourDescription: string;
  };
}[];

describe("TermResourceReferenceSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTermResourceReferenceSchema) {
    it(`for ${testInput.testCaseDescription} parsing ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = TermResourceReferenceSchema.safeParse(testInput.data);
      expect(parsingResult.success).toBe(testOutcome.data);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<TermResourceReference>();
      }
    });
  }
});
