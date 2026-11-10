import { describe, expect, it } from "bun:test";

import z from "zod";

import { createTemplateRenderFunctionSchema } from "./templateRenderFunction.js";

const testCasesForCreateTemplateRenderFunctionSchema = [
  {
    testInput: {
      data: {
        templateInputSchema: z.object({
          x: z.number(),
        }),
        templateRenderFnImplementation: (functionSchema) => functionSchema.implement(() => "hello"),
        functionInput: {
          x: 1,
        },
      },
      testCaseDescription: 'dummy function that resolves any input to "hello"',
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should succeed with valid input",
    },
  },
  {
    testInput: {
      data: {
        templateInputSchema: z.object({
          x: z.number(),
        }),
        templateRenderFnImplementation: (functionSchema) => functionSchema.implement(() => "hello"),
        functionInput: {
          x: "invalid input",
        },
      },
      testCaseDescription: 'dummy function that resolves any input to "hello"',
    },
    testOutcome: {
      data: {
        result: false,
      },
      testBehaviourDescription: "should fail with invalid input",
    },
  },
] satisfies {
  testInput: {
    data: {
      templateInputSchema: z.ZodObject;
      templateRenderFnImplementation: (functionSchema: z.ZodFunction) => (...args: any[]) => any;
      functionInput: object;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: boolean;
    };
  };
}[];

describe("createTemplateRenderFunctionSchema", () => {
  for (const { testInput, testOutcome } of testCasesForCreateTemplateRenderFunctionSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const implementedFunction = testInput.data.templateRenderFnImplementation(
        createTemplateRenderFunctionSchema(testInput.data.templateInputSchema),
      );
      if (testOutcome.data.result === true) {
        expect(() =>
          implementedFunction(testInput.data.functionInput as any as never),
        ).not.toThrow();
      } else {
        expect(() => implementedFunction(testInput.data.functionInput as any as never)).toThrow();
      }
    });
  }
});
