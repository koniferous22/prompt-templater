import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { InputWorkflowStepSchema } from "./inputStep.js";

const testCasesForInputWorkflowStepSchema = [
  {
    testInput: {
      data: {
        id: "input",
        type: "input",
        message: "Enter a number",
        validation: {
          type: "optional",
          validator: "number",
        },
      },
      testCaseDescription: "valid optional number validation",
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
        id: "input",
        type: "input",
        message: "Enter a string",
        validation: {
          type: "optional",
          validator: "string",
        },
      },
      testCaseDescription: "valid optional string validation",
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
        id: "input",
        type: "input",
        message: "Enter a boolean",
        validation: {
          type: "optional",
          validator: "boolean",
        },
      },
      testCaseDescription: "valid optional boolean validation",
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
        id: "input",
        type: "input",
        message: "Enter a required number",
        validation: {
          type: "required",
          validator: "number",
        },
      },
      testCaseDescription: "valid required number validation",
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
        id: "input",
        type: "input",
        message: "Enter a required string",
        validation: {
          type: "required",
          validator: "string",
        },
      },
      testCaseDescription: "valid required string validation",
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
        id: "input",
        type: "input",
        message: "Enter a required boolean",
        validation: {
          type: "required",
          validator: "boolean",
        },
      },
      testCaseDescription: "valid required boolean validation",
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
        id: "input",
        type: "input",
        message: "Enter a boolean with default",
        validation: {
          type: "optionalWithDefault",
          validator: "boolean",
          value: true,
        },
      },
      testCaseDescription: "valid optionalWithDefault boolean validation",
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
        id: "input",
        type: "input",
        message: "Enter a number with default",
        validation: {
          type: "optionalWithDefault",
          validator: "number",
          value: 42,
        },
      },
      testCaseDescription: "valid optionalWithDefault number validation",
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
        id: "input",
        type: "input",
        message: "Enter a string with default",
        validation: {
          type: "optionalWithDefault",
          validator: "string",
          value: "default-value",
        },
      },
      testCaseDescription: "valid optionalWithDefault string validation",
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
        id: "input",
        type: "input",
        message: "Enter something",
        validation: {
          type: "optionalWithDefault",
          value: "test",
        },
      },
      testCaseDescription: 'optionalWithDefault validation without "validator" attribute',
    },
    testOutcome: {
      testBehaviourDescription: 'succeed with default "string" validator',
      data: {
        result: true,
      },
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof InputWorkflowStepSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("InputWorkflowStepSchema", () => {
  for (const { testInput, testOutcome } of testCasesForInputWorkflowStepSchema) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = InputWorkflowStepSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
