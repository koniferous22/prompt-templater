import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type z from "zod";

import { AbsolutePathSchema, RelativePathSchema } from "../../../path/customTypes/index.js";
import { SelectorSchema } from "../schemas/selector.js";
import { WorkflowChoicesFragmentToTermResourceReference } from "./workflowChoicesFragmentToResourceReference.js";

const testCasesForPlainFileReferenceOptionsSchema = [
  {
    testInput: {
      data: {
        type: "jsonFile",
        file: AbsolutePathSchema.parse("/absolute/path/to/term.json"),
        selector: null,
      },
      testCaseDescription: "fragment with absolute json path and null selector",
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
        file: AbsolutePathSchema.parse("/absolute/path/to/term.json"),
        selector: SelectorSchema.parse([1, "objectKey"]),
      },
      testCaseDescription: "fragment with absolute json path and selector",
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
        type: "yamlFile",
        file: AbsolutePathSchema.parse("/absolute/path/to/term.yml"),
        selector: null,
      },
      testCaseDescription: "fragment with absolute yaml path and null selector",
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
        type: "yamlFile",
        file: AbsolutePathSchema.parse("/absolute/path/to/term.yml"),
        selector: SelectorSchema.parse([1, "objectKey"]),
      },
      testCaseDescription: "fragment with absolute yaml path and selector",
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
        type: "plainFile",
        file: AbsolutePathSchema.parse("/absolute/path/to/term.txt"),
      },
      testCaseDescription: "fragment with absolute plaintext path without specified options",
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
        type: "plainFile",
        file: AbsolutePathSchema.parse("/absolute/path/to/term.txt"),
        options: {
          emptyLines: "allowTrailing",
          trimWhitespace: true,
        },
      },
      testCaseDescription: "fragment with absolute plaintext path with specified options",
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
        file: RelativePathSchema.parse("path/to/term.json"),
        selector: null,
      },
      testCaseDescription: "fragment with absolute json path and null selector",
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
        file: RelativePathSchema.parse("path/to/term.json"),
        selector: SelectorSchema.parse([1, "objectKey"]),
      },
      testCaseDescription: "fragment with absolute json path and selector",
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
        type: "yamlFile",
        file: RelativePathSchema.parse("path/to/term.yml"),
        selector: null,
      },
      testCaseDescription: "fragment with absolute yaml path and null selector",
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
        type: "yamlFile",
        file: RelativePathSchema.parse("path/to/term.yml"),
        selector: SelectorSchema.parse([1, "objectKey"]),
      },
      testCaseDescription: "fragment with absolute yaml path and selector",
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
        type: "plainFile",
        file: RelativePathSchema.parse("path/to/term.txt"),
      },
      testCaseDescription: "fragment with absolute plaintext path without specified options",
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
        type: "plainFile",
        file: RelativePathSchema.parse("path/to/term.txt"),
        options: {
          emptyLines: "allowTrailing",
          trimWhitespace: true,
        },
      },
      testCaseDescription: "fragment with absolute plaintext path with specified options",
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
    data: z.input<typeof WorkflowChoicesFragmentToTermResourceReference>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: boolean;
    };
    testBehaviourDescription: string;
  };
}[];

describe("WorkflowChoicesFragmentToTermResourceReference", () => {
  for (const { testInput, testOutcome } of testCasesForPlainFileReferenceOptionsSchema) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = WorkflowChoicesFragmentToTermResourceReference.safeParse(
        testInput.data,
      );
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
