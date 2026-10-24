import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NonEmptyStringToTemplateResourceReferenceSchema } from "../../../../../validation/resourceReference/template/codecs/nonEmptyStringToResourceReference.js";
import type { TemplateResourceReference } from "../../../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import { NonEmptyStringToTermResourceReferenceSchema } from "../../../../../validation/resourceReference/term/codecs/nonEmptyStringToResourceReference.js";
import type { TermResourceReference } from "../../../../../validation/resourceReference/term/schemas/termResourceReference.js";
import {
  WorkflowSchema,
  type Workflow,
} from "../../../../../validation/resources/config/workflow/schemas/workflow.js";
import { workflowResourceGetReferences } from "./getReferences.js";

const testCasesForWorkflowResourceGetReferences = [
  {
    testInput: {
      data: {
        workflow: WorkflowSchema.parse({
          templateFile: "templates/test-template.hbs",
          steps: [],
        }),
      },
      testCaseDescription: "empty workflow with only template reference",
    },
    testOutcome: {
      data: {
        result: {
          template: NonEmptyStringToTemplateResourceReferenceSchema.parse(
            "templates/test-template.hbs",
          ),
          terms: [],
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        workflow: WorkflowSchema.parse({
          templateFile: "templates/test-template.hbs",
          steps: [
            {
              id: "step1",
              type: "checkbox",
              message: "choose an option",
              valueType: "string",
              choices: "terms/test-term.json",
            },
          ],
        }),
      },
      testCaseDescription: "workflow containing checkbox step",
    },
    testOutcome: {
      data: {
        result: {
          template: NonEmptyStringToTemplateResourceReferenceSchema.parse(
            "templates/test-template.hbs",
          ),
          terms: [NonEmptyStringToTermResourceReferenceSchema.parse("terms/test-term.json")],
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        workflow: WorkflowSchema.parse({
          templateFile: "templates/test-template.hbs",
          steps: [
            {
              id: "step1",
              type: "select",
              message: "choose an option",
              valueType: "string",
              choices: "terms/test-term.json",
            },
          ],
        }),
      },
      testCaseDescription: "workflow containing select step",
    },
    testOutcome: {
      data: {
        result: {
          template: NonEmptyStringToTemplateResourceReferenceSchema.parse(
            "templates/test-template.hbs",
          ),
          terms: [NonEmptyStringToTermResourceReferenceSchema.parse("terms/test-term.json")],
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        workflow: WorkflowSchema.parse({
          templateFile: "templates/test-template.hbs",
          steps: [
            {
              id: "step1",
              type: "checkbox",
              message: "choose an option",
              valueType: "string",
              choices: "terms/test-term.json",
            },
            {
              id: "step2",
              type: "input",
              message: "enter input",
              validation: {
                type: "optional",
              },
            },
            {
              id: "step3",
              type: "select",
              message: "choose an option",
              valueType: "string",
              choices: "terms/test-term.json",
            },
          ],
        }),
      },
      testCaseDescription: "workflow containing multiple term references",
    },
    testOutcome: {
      data: {
        result: {
          template: NonEmptyStringToTemplateResourceReferenceSchema.parse(
            "templates/test-template.hbs",
          ),
          terms: [
            NonEmptyStringToTermResourceReferenceSchema.parse("terms/test-term.json"),
            NonEmptyStringToTermResourceReferenceSchema.parse("terms/test-term.json"),
          ],
        },
      },
      testBehaviourDescription: "succeed with preserved duplicates",
    },
  },
] satisfies {
  testInput: {
    data: {
      workflow: Workflow;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: {
        template: TemplateResourceReference;
        terms: TermResourceReference[];
      };
    };
    testBehaviourDescription: string;
  };
}[];

describe("workflowResourceGetReferences", () => {
  for (const { testInput, testOutcome } of testCasesForWorkflowResourceGetReferences) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const result = workflowResourceGetReferences(testInput.data.workflow);
      assert.deepEqual(result, testOutcome.data.result);
    });
  }
});
