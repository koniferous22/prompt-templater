import assert from "node:assert";
import { describe, it } from "node:test";

import type z from "zod";

import { InputWorkflowStepSchema } from "./input.js";

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
        message: "",
        validation: {
          type: "optional",
          validator: "string",
        },
      },
      testCaseDescription: "empty message string",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
      },
    },
  },
  {
    testInput: {
      data: {
        id: "input",
        type: "not-input" as any,
        message: "Enter something",
        validation: {
          type: "optional",
          validator: "string",
        },
      },
      testCaseDescription: "invalid step type (not 'input')",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
      },
    },
  },
  {
    testInput: {
      data: {
        id: "input",
        type: "input",
        message: "Enter something",
      } as any,
      testCaseDescription: "missing validation field",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
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
          type: "optional",
          validator: "unknown",
        },
      },
      testCaseDescription: "unknown validator value for optional",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
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
          value: "not-a-boolean" as any,
        },
      },
      testCaseDescription: "optionalWithDefault boolean with non-boolean value",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
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
          value: "not-a-number" as any,
        },
      },
      testCaseDescription: "optionalWithDefault number with non-number value",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
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
          value: "",
        },
      },
      testCaseDescription: "optionalWithDefault string with empty string value",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
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
          value: undefined as any,
        },
      },
      testCaseDescription: "optionalWithDefault missing value field",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
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
          value: 123 as any,
        },
      },
      testCaseDescription: "optionalWithDefault string validator with number value",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
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
          type: "unknownType" as any,
          validator: "string",
        },
      },
      testCaseDescription: "unknown validation type",
    },
    testOutcome: {
      testBehaviourDescription: "fail",
      data: {
        result: false,
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
    it(`for "${testInput.testCaseDescription}" parsing should "${testOutcome.testBehaviourDescription}"`, async () => {
      const parsingResult = InputWorkflowStepSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.result);
    });
  }
});
