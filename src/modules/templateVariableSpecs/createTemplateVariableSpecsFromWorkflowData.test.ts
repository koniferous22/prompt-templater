import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";

import type z from "zod";

import type { AppErrorCode } from "../../constants/errorCodes.js";
import { AbsolutePathSchema } from "../../validation/path/customTypes/index.js";
import type { WorkflowSchema } from "../../validation/resources/config/workflow/schemas/workflow.js";
import { NonEmptyStringSchema } from "../../validation/string/customTypes/string.js";
import { createTemplateVariableSpecsFromWorkflowData } from "./createTemplateVariableSpecsFromWorkflowData.js";

const testCasesForCreateTemplateVariableSpecsFromWorkflowData = [
  {
    testInput: {
      data: {
        workflowSteps: [
          {
            id: NonEmptyStringSchema.parse("inputStepVariable"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "input",
            validation: {
              type: "optional",
              validator: "string",
            },
          },
          {
            id: NonEmptyStringSchema.parse("editorStepVariable"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "editor",
            validation: {
              type: "optional",
            },
          },
          {
            id: NonEmptyStringSchema.parse("selectStepVariable"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "select",
            valueType: "string",
            choices: {
              type: "literalValues",
              values: {
                type: "literal",
                format: "array",
                valueType: "string",
                values: [
                  NonEmptyStringSchema.parse("value1"),
                  NonEmptyStringSchema.parse("value2"),
                ],
              },
            },
          },
        ],
        furtherSchemaTestingInput: {
          inputStepVariable: "input from inquirer input prompt",
          editorStepVariable: "input from inquirer editor prompt",
          selectStepVariable: "value1",
        },
      },
      testCaseDescription: "template specs from workflow steps",
    },
    testOutcome: {
      data: {
        createTemplateVariableSpecsResult: {
          result: true,
          zodSchemaParseResult: true,
        },
      },
      testBehaviourDescription: "should successfully create object",
    },
  },
  {
    testInput: {
      data: {
        workflowSteps: [
          {
            id: NonEmptyStringSchema.parse("duplicateStepId"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "input",
            validation: {
              type: "optional",
              validator: "string",
            },
          },
          {
            id: NonEmptyStringSchema.parse("duplicateStepId"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "editor",
            validation: {
              type: "optional",
            },
          },
          {
            id: NonEmptyStringSchema.parse("selectStepVariable"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "select",
            valueType: "string",
            choices: {
              type: "literalValues",
              values: {
                type: "literal",
                format: "array",
                valueType: "string",
                values: [
                  NonEmptyStringSchema.parse("value1"),
                  NonEmptyStringSchema.parse("value2"),
                ],
              },
            },
          },
        ],
        furtherSchemaTestingInput: {
          inputStepVariable: "input from inquirer input prompt",
          editorStepVariable: "input from inquirer editor prompt",
          selectStepVariable: "value1",
        },
      },
      testCaseDescription: "workflow steps containing duplicate step id",
    },
    testOutcome: {
      data: {
        createTemplateVariableSpecsResult: {
          result: false,
          errorCode:
            "module_templateVariableSpecs_createTemplateVariableSpecsFromWorkflowData_duplicateVariable",
        },
      },
      testBehaviourDescription: "should successfully create object",
    },
  },
  {
    testInput: {
      data: {
        workflowSteps: [
          {
            id: NonEmptyStringSchema.parse("duplicateVariable"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "input",
            validation: {
              type: "optional",
              validator: "string",
            },
          },
          {
            id: NonEmptyStringSchema.parse("editorStepId"),
            targetVariable: NonEmptyStringSchema.parse("duplicateVariable"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "editor",
            validation: {
              type: "optional",
            },
          },
          {
            id: NonEmptyStringSchema.parse("selectStepVariable"),
            message: NonEmptyStringSchema.parse("Enter input"),
            type: "select",
            valueType: "string",
            choices: {
              type: "literalValues",
              values: {
                type: "literal",
                format: "array",
                valueType: "string",
                values: [
                  NonEmptyStringSchema.parse("value1"),
                  NonEmptyStringSchema.parse("value2"),
                ],
              },
            },
          },
        ],
        furtherSchemaTestingInput: {
          inputStepVariable: "input from inquirer input prompt",
          editorStepVariable: "input from inquirer editor prompt",
          selectStepVariable: "value1",
        },
      },
      testCaseDescription: "workflow steps containing duplicate step id",
    },
    testOutcome: {
      data: {
        createTemplateVariableSpecsResult: {
          result: false,
          errorCode:
            "module_templateVariableSpecs_createTemplateVariableSpecsFromWorkflowData_duplicateVariable",
        },
      },
      testBehaviourDescription: "should successfully create object",
    },
  },
] satisfies {
  testInput: {
    data: {
      workflowSteps: z.output<typeof WorkflowSchema>["steps"];
      furtherSchemaTestingInput: any;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      createTemplateVariableSpecsResult:
        | {
            result: true;
            zodSchemaParseResult: boolean | null;
          }
        | {
            result: false;
            errorCode: AppErrorCode;
          };
    };
    testBehaviourDescription: string;
  };
}[];

describe("createTemplateVariableSpecsFromWorkflowData", () => {
  for (const {
    testInput,
    testOutcome,
  } of testCasesForCreateTemplateVariableSpecsFromWorkflowData) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const templateVariableSpecsResult = createTemplateVariableSpecsFromWorkflowData(
        { steps: testInput.data.workflowSteps },
        { file: AbsolutePathSchema.parse("/example/absolute/path") },
      );
      if (testOutcome.data.createTemplateVariableSpecsResult.result === true) {
        assert.ok(templateVariableSpecsResult.isOk());
        if (testOutcome.data.createTemplateVariableSpecsResult.zodSchemaParseResult !== null) {
          const generatedZodSchema = templateVariableSpecsResult.value.getZodSchema();
          const generatedZodSchemaParseResult = generatedZodSchema.safeParse(
            testInput.data.furtherSchemaTestingInput,
          );
          assert.ok(generatedZodSchemaParseResult.success);
        }
      } else {
        assert.ok(templateVariableSpecsResult.isErr());
        expect(templateVariableSpecsResult.error.code).toBe(
          testOutcome.data.createTemplateVariableSpecsResult.errorCode,
        );
      }
    });
  }
});
