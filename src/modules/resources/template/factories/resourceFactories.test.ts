import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Ok } from "neverthrow";

import type { TemplateEngineType } from "../../../../constants/enums/templateEngines/templateEngine.js";
import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import { NonEmptyStringToConfigResourceReferenceSchema } from "../../../../validation/resourceReference/config/codecs/nonEmptyStringToResourceReference.js";
import { WorkspaceContextSchema } from "../../../../validation/workspaceContext/schemas/workspaceContext.js";
import type { ConfigResourceTypes } from "../../config/factories/resourceFactories.js";
import { configResourceFromReference } from "../../config/resourceFromReference.js";
import { templateResourceFactories } from "./resourceFactories.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "unit-test-workspace"),
);

const workflowResourceFixtureBasicResult = (await configResourceFromReference(
  "workflow",
  NonEmptyStringToConfigResourceReferenceSchema.parse("workflows/test-workflow.json"),
  workspaceContext,
)) as Extract<Awaited<ReturnType<typeof configResourceFromReference<"workflow">>>, Ok<any, any>>;
const workflowResourceFixtureBasic = workflowResourceFixtureBasicResult._unsafeUnwrap();

const workflowResourceFixtureBasicIfStatementResult = (await configResourceFromReference(
  "workflow",
  NonEmptyStringToConfigResourceReferenceSchema.parse(
    "workflows/test-workflow-for-template-with-basic-if-statement.json",
  ),
  workspaceContext,
)) as Extract<Awaited<ReturnType<typeof configResourceFromReference<"workflow">>>, Ok<any, any>>;
const workflowResourceFixtureBasicIfStatement =
  workflowResourceFixtureBasicIfStatementResult._unsafeUnwrap();

const workflowResourceFixtureWithEachBlockResult = (await configResourceFromReference(
  "workflow",
  NonEmptyStringToConfigResourceReferenceSchema.parse(
    "workflows/test-workflow-for-template-with-each-block.json",
  ),
  workspaceContext,
)) as Extract<Awaited<ReturnType<typeof configResourceFromReference<"workflow">>>, Ok<any, any>>;
const workflowResourceFixtureWithEachBlock =
  workflowResourceFixtureWithEachBlockResult._unsafeUnwrap();

// TODO - missing test case
// * invoking render with wrong variable
const testCasesCreateTemplate = [
  {
    testInput: {
      data: {
        template: "passed value from workflow: {{selectStep}}",
        format: "handlebars",
        sourceWorkflow: workflowResourceFixtureBasic,
        inputDataForRender: {
          selectStep: "passedValue",
        },
      },
      testCaseDescription: "template with basic interpolated variable",
    },
    testOutcome: {
      data: {
        result: true,
        validateInputShape: {
          result: true,
          renderResult: {
            result: true,
            renderedContents: "passed value from workflow: passedValue",
          },
        },
      },
      testBehaviourDescription: "should succeed with correct rendered contents",
    },
  },
  {
    testInput: {
      data: {
        template: "Hello {{name",
        format: "handlebars",
        sourceWorkflow: workflowResourceFixtureBasic,
        inputDataForRender: {
          name: "passedValue",
        },
      },
      testCaseDescription: "template syntax error",
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_templateEngines_handlebars_createHandlebarsTemplate_unableToParseInput",
      },
      testBehaviourDescription: "should fail",
    },
  },
  {
    testInput: {
      data: {
        template: "passed value from workflow: {{wrongVariableName}}",
        format: "handlebars",
        sourceWorkflow: workflowResourceFixtureBasic,
        inputDataForRender: {
          selectStep: "passedValue",
        },
      },
      testCaseDescription: "template with unreferenced variable",
    },
    testOutcome: {
      data: {
        result: true,
        validateInputShape: {
          result: false,
          errorCode:
            "module_templateEngines_handlebars_validateExpectedVariableSpecs_attributeNotFound",
        },
      },
      testBehaviourDescription: "should fail on input shape validation",
    },
  },
  {
    testInput: {
      data: {
        template: "passed value from workflow: {{selectStep}}",
        format: "handlebars",
        sourceWorkflow: workflowResourceFixtureBasic,
        inputDataForRender: {
          wrongPassedVariable: "passedValue",
        },
      },
      testCaseDescription: "template with wrong render variable input",
    },
    testOutcome: {
      data: {
        result: true,
        validateInputShape: {
          result: true,
          renderResult: {
            result: false,
            errorCode: "module_resources_template_createRenderFunction_invalidRenderingInput",
          },
        },
      },
      testBehaviourDescription: "should fail on input shape validation",
    },
  },
  {
    testInput: {
      data: {
        template: `Hello {{
  name
}} - Status: {{#if (
  eq status "active"
)}}Active{{
  else if (eq status "pending")
}}Pending{{
  else if (eq status "inactive")
}}Inactive{{
  else
}}Unknown{{/if}}`,
        format: "handlebars",
        sourceWorkflow: workflowResourceFixtureBasicIfStatement,
        inputDataForRender: {
          name: "passedName",
          status: "active",
        },
      },
      testCaseDescription: "template with basic if statement",
    },
    testOutcome: {
      data: {
        result: true,
        validateInputShape: {
          result: true,
          renderResult: {
            result: true,
            renderedContents: "Hello passedName - Status: Active",
          },
        },
      },
      testBehaviourDescription: "should succeed with correct rendered contents",
    },
  },
  {
    testInput: {
      data: {
        template: `
Hello {{name}}!

{{#each items}}
  - {{this}} ({{../name}})
{{else}}
  No choices selected by {{name}}
{{/each}}`,
        format: "handlebars",
        sourceWorkflow: workflowResourceFixtureWithEachBlock,
        inputDataForRender: {
          name: "passedName",
          items: ["choice1", "choice2"],
        },
      },
      testCaseDescription: "template with unreferenced variable",
    },
    testOutcome: {
      data: {
        result: true,
        validateInputShape: {
          result: true,
          renderResult: {
            result: true,
            renderedContents: `
Hello passedName!

  - choice1 (passedName)
  - choice2 (passedName)
`,
          },
        },
      },
      testBehaviourDescription: "should succeed with correct rendered contents",
    },
  },
] satisfies {
  testInput: {
    data: {
      template: string;
      format: TemplateEngineType;
      sourceWorkflow: ConfigResourceTypes["workflow"];
      inputDataForRender: Record<string, any>;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: false;
          errorCode: AppErrorCode;
        }
      | {
          result: true;
          validateInputShape:
            | {
                result: false;
                errorCode: AppErrorCode;
              }
            | {
                result: true;
                renderResult:
                  | {
                      result: false;
                      errorCode: AppErrorCode;
                    }
                  | {
                      result: true;
                      renderedContents: string;
                    };
              };
        };
    testBehaviourDescription: string;
  };
}[];

describe("templateFactories.template", () => {
  for (const { testInput, testOutcome } of testCasesCreateTemplate) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceResult = templateResourceFactories.template(
        testInput.data.template,
        testInput.data.format,
        {
          sourceWorkflow: testInput.data.sourceWorkflow,
        },
        {
          file: AbsolutePathSchema.parse("/example/absolute/path/to/template.hbs"),
        },
      );
      if (testOutcome.data.result === false) {
        assert.ok(resourceResult.isErr());
        expect(resourceResult.error.code).toBe(testOutcome.data.errorCode);
      } else {
        assert.ok(resourceResult.isOk());
        const templateResource = resourceResult.value;
        const validateInputShapeResult = templateResource.validateInputShape();
        if (testOutcome.data.validateInputShape.result === false) {
          assert.ok(validateInputShapeResult.isErr());
          assert.strictEqual(validateInputShapeResult.error.type, "plain");
          expect(validateInputShapeResult.error.code).toBe(
            testOutcome.data.validateInputShape.errorCode,
          );
        } else {
          assert.ok(validateInputShapeResult.isOk());
          const renderFn = templateResource.createRenderFunction();
          const renderResult = renderFn(testInput.data.inputDataForRender);
          if (testOutcome.data.validateInputShape.renderResult.result === false) {
            assert.ok(renderResult.isErr());
          } else {
            assert.ok(renderResult.isOk());
            expect(renderResult.value).toBe(
              testOutcome.data.validateInputShape.renderResult.renderedContents,
            );
          }
        }
      }
    });
  }
});
