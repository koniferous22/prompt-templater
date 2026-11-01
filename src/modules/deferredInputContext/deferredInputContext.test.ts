import assert, { ok } from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { Ok } from "neverthrow";
import { match } from "ts-pattern";

import type { AppErrorCode } from "../../constants/errorCodes.js";
import { AbsolutePathSchema } from "../../validation/path/customTypes/index.js";
import {
  ConfigResourceFileSchema,
  type ConfigResourceFile,
} from "../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import { NonEmptyStringToConfigResourceReferenceSchema } from "../../validation/resourceReference/config/codecs/nonEmptyStringToResourceReference.js";
import {
  NonEmptyStringSchema,
  type NonEmptyString,
} from "../../validation/string/customTypes/string.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../validation/workspaceContext/schemas/workspaceContext.js";
import type { configResourceFileFromReference } from "../resources/config/utils/resourceFileFromReference.js";
import { createDeferredContext, type DeferredContextOpts } from "./deferredInputContext.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

// Readable options that is going to be serialized in error message
type TestCaseData = {
  workflowPreset: NonEmptyString | undefined;
};

const preprocessTestCaseData = (testCaseData: TestCaseData) => {
  const result = {
    workflowPreset:
      testCaseData.workflowPreset &&
      NonEmptyStringToConfigResourceReferenceSchema.parse(testCaseData.workflowPreset),
  } satisfies DeferredContextOpts;
  return result;
};

type CreateDeferredContextStateResult = ReturnType<
  Extract<Awaited<ReturnType<typeof createDeferredContext>>, Ok<any, any>>["value"]["getState"]
>;

type CreateDeferredContextPlainStateResult = ReturnType<
  Extract<Awaited<ReturnType<typeof createDeferredContext>>, Ok<any, any>>["value"]["getPlainState"]
>;
type ResolveDeferredContextResult = Extract<
  Awaited<
    ReturnType<
      Extract<Awaited<ReturnType<typeof createDeferredContext>>, Ok<any, any>>["value"]["resolve"]
    >
  >,
  Ok<any, any>
>["value"];

const testCasesForDeferredInputContext = [
  {
    testInput: {
      data: {
        testCase: {
          workflowPreset: undefined,
        },
        workspaceContext: workspaceContext,
      },
    },
    testOutcome: {
      data: {
        type: "create",
        expectedState: {
          workflowPreset: undefined,
        },
      },
      testBehaviourDescription: 'should resolve workflowPreset as "undefined"',
    },
  },
  {
    testInput: {
      data: {
        testCase: {
          workflowPreset: NonEmptyStringSchema.parse("/non/existing/path/to/workflow-preset.json"),
        },
        workspaceContext: workspaceContext,
      },
    },
    testOutcome: {
      data: {
        type: "returnError",
        error: {
          type: "aggregate",
          errorCodes: [
            "module_deferredInputContext_rejectedValue",
            "module_resources_config_utils_resourceFileFromAbsolutePath_invalidInput",
          ],
        },
      },
      testBehaviourDescription: "should fail with correct error code",
    },
  },
  {
    testInput: {
      data: {
        testCase: {
          workflowPreset: NonEmptyStringSchema.parse(
            join(workspaceContext, "workflows/test-workflow.json"),
          ),
        },
        workspaceContext: workspaceContext,
      },
    },
    testOutcome: {
      data: {
        type: "create",
        expectedState: {
          workflowPreset: {
            type: "resolved",
            value: await ConfigResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "workflows/test-workflow.json"),
            }),
          },
        },
      },
      testBehaviourDescription: "should resolve workflowPreset from absolute path",
    },
  },
  {
    testInput: {
      data: {
        testCase: {
          workflowPreset: NonEmptyStringSchema.parse("workflows/test-workflow.json"),
        },
        workspaceContext: workspaceContext,
      },
    },
    testOutcome: {
      data: {
        type: "createAndResolve",
        expectedPlainState: {},
        expectedDeferredResult: {
          workflowPreset: await ConfigResourceFileSchema.parseAsync({
            format: "json",
            path: join(workspaceContext, "workflows/test-workflow.json"),
          }),
        },
      },
      testBehaviourDescription: "should resolve deferred workflowPreset from relative path",
    },
  },
] satisfies {
  testInput: {
    data: {
      testCase: TestCaseData;
      workspaceContext: WorkspaceContext;
    };
  };
  testOutcome: {
    testBehaviourDescription: string;
    data:
      | {
          type: "create";
          expectedState: CreateDeferredContextStateResult;
        }
      | {
          type: "returnError";
          error:
            | {
                type: "plain";
                errorCode: AppErrorCode;
              }
            | {
                type: "aggregate";
                errorCodes: [AppErrorCode, ...AppErrorCode[]];
              };
        }
      | {
          type: "createAndResolve";
          expectedPlainState: CreateDeferredContextPlainStateResult;
          expectedDeferredResult: ResolveDeferredContextResult;
        };
  };
}[];

describe("WorkspaceContextSchema", () => {
  for (const { testInput, testOutcome } of testCasesForDeferredInputContext) {
    it(`for deferred context ${JSON.stringify(testInput.data.testCase)} it ${testOutcome.testBehaviourDescription}`, async () => {
      const testInputData = preprocessTestCaseData(testInput.data.testCase);
      const testResult = await createDeferredContext(testInputData);
      match(testOutcome.data)
        .with({ type: "create" }, async (testCaseForCreate) => {
          assert.ok(testResult.isOk());
          assert.deepEqual(testResult.value.getState(), testCaseForCreate.expectedState);
        })
        .with({ type: "returnError" }, async () => {
          assert.ok(testResult.isErr());
          assert.strictEqual(testResult.error.type, "aggregate");
        })
        .with({ type: "createAndResolve" }, async (testCaseForCreateAndResolve) => {
          assert.ok(testResult.isOk());
          assert.deepEqual(
            testResult.value.getPlainState(),
            testCaseForCreateAndResolve.expectedPlainState,
          );
          const resolveResult = await testResult.value.resolve(testInput.data.workspaceContext);
          assert.ok(resolveResult.isOk());
          assert.deepEqual(resolveResult.value, testCaseForCreateAndResolve.expectedDeferredResult);
        });
    });
  }
});
