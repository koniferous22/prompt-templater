import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import {
  ConfigResourceFileSchema,
  type ConfigResourceFile,
} from "../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import {
  ConfigResourceReferenceSchema,
  type ConfigResourceReference,
} from "../../../validation/resourceReference/config/schemas/configResourceReference.js";
import {
  TemplateResourceReferenceSchema,
  type TemplateResourceReference,
} from "../../../validation/resourceReference/template/schemas/templateResourceReference.js";
import {
  TermResourceReferenceSchema,
  type TermResourceReference,
} from "../../../validation/resourceReference/term/schemas/termResourceReference.js";
import { WorkspaceContextSchema } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { createResourceContext } from "./resourceContext.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForLoadWorkflow = [
  {
    testInput: {
      data: {
        resourceContextData: {
          workflowFiles: [
            await ConfigResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "workflows/test-workflow-with-term-reference.json"),
            }),
          ],
        },
        workflowReference: ConfigResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "workflows/test-workflow-with-term-reference.json",
          },
        }),
      },
      testCaseDescription: '"loadWorkflow" call with valid workflow',
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        resourceContextData: {
          workflowFiles: [
            await ConfigResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "workflows/test-workflow-with-term-reference.json"),
            }),
          ],
        },
        workflowReference: ConfigResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "workflows/does-not-exist.json",
          },
        }),
      },
      testCaseDescription: '"loadWorkflow" call with non-existing workflow',
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resourceContext_loadWorkflow_workflowNotFound",
      },
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: {
      resourceContextData: {
        workflowFiles: ConfigResourceFile[];
      };
      workflowReference: ConfigResourceReference;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

const testCasesForLoadTemplate = [
  {
    testInput: {
      data: {
        resourceContextData: {
          workflowFiles: [
            await ConfigResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "workflows/test-workflow-with-term-reference.json"),
            }),
          ],
        },
        templateReference: TemplateResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "handlebars",
            path: "templates/test-template.hbs",
          },
        }),
      },
      testCaseDescription: '"loadTemplate" call with valid template',
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        resourceContextData: {
          workflowFiles: [
            await ConfigResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "workflows/test-workflow-with-term-reference.json"),
            }),
          ],
        },
        templateReference: TemplateResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "handlebars",
            path: "templates/does-not-exist.hbs",
          },
        }),
      },
      testCaseDescription: '"loadTemplate" call with non-existing template',
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resourceContext_loadTemplate_templateNotFound",
      },
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: {
      resourceContextData: {
        workflowFiles: ConfigResourceFile[];
      };
      templateReference: TemplateResourceReference;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

const testCasesForLoadTerm = [
  {
    testInput: {
      data: {
        resourceContextData: {
          workflowFiles: [
            await ConfigResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "workflows/test-workflow-with-term-reference.json"),
            }),
          ],
        },
        termReference: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "terms/test-term.json",
            selector: null,
          },
        }),
      },
      testCaseDescription: '"loadTerm" call with valid term',
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should succeed",
    },
  },
  {
    testInput: {
      data: {
        resourceContextData: {
          workflowFiles: [
            await ConfigResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "workflows/test-workflow-with-term-reference.json"),
            }),
          ],
        },
        termReference: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "terms/does-not-exist.json",
            selector: null,
          },
        }),
      },
      testCaseDescription: '"loadTerm" call with non-existing term',
    },
    testOutcome: {
      data: {
        result: false,
        errorCode: "module_resourceContext_loadTerm_termNotFound",
      },
      testBehaviourDescription: "should fail",
    },
  },
] satisfies {
  testInput: {
    data: {
      resourceContextData: {
        workflowFiles: ConfigResourceFile[];
      };
      termReference: TermResourceReference;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data:
      | {
          result: true;
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
    testBehaviourDescription: string;
  };
}[];

describe("createResourceContext", () => {
  describe("loadWorkflow", () => {
    for (const { testInput, testOutcome } of testCasesForLoadWorkflow) {
      it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
        const resourceContext = createResourceContext(workspaceContext);
        // Prepare resource context
        for (const workflowFile of testInput.data.resourceContextData.workflowFiles) {
          const addWorkflowResult = await resourceContext.addWorkflow(workflowFile);
          assert.ok(addWorkflowResult.isOk());
        }
        const loadWorkflowResult = resourceContext.loadWorkflow(testInput.data.workflowReference);
        if (testOutcome.data.result === true) {
          assert.ok(loadWorkflowResult.isOk());
        } else {
          assert.ok(loadWorkflowResult.isErr());
          expect(loadWorkflowResult.error.code).toBe(testOutcome.data.errorCode);
        }
      });
    }
  });
  describe("loadTemplate", () => {
    for (const { testInput, testOutcome } of testCasesForLoadTemplate) {
      it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
        const resourceContext = createResourceContext(workspaceContext);
        // Prepare resource context
        for (const workflowFile of testInput.data.resourceContextData.workflowFiles) {
          const addWorkflowResult = await resourceContext.addWorkflow(workflowFile);
          assert.ok(addWorkflowResult.isOk());
        }
        const loadTemplateResult = resourceContext.loadTemplate(testInput.data.templateReference);
        if (testOutcome.data.result === true) {
          assert.ok(loadTemplateResult.isOk());
        } else {
          assert.ok(loadTemplateResult.isErr());
          expect(loadTemplateResult.error.code).toBe(testOutcome.data.errorCode);
        }
      });
    }
  });
  describe("loadTerm", () => {
    for (const { testInput, testOutcome } of testCasesForLoadTerm) {
      it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
        const resourceContext = createResourceContext(workspaceContext);
        // Prepare resource context
        for (const workflowFile of testInput.data.resourceContextData.workflowFiles) {
          const addWorkflowResult = await resourceContext.addWorkflow(workflowFile);
          assert.ok(addWorkflowResult.isOk());
        }
        const loadTermResult = resourceContext.loadTerm(testInput.data.termReference);
        if (testOutcome.data.result === true) {
          assert.ok(loadTermResult.isOk());
        } else {
          assert.ok(loadTermResult.isErr());
          expect(loadTermResult.error.code).toBe(testOutcome.data.errorCode);
        }
      });
    }
  });
});
