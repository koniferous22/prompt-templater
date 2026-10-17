import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { Err, Ok, Result } from "neverthrow";
import { match } from "ts-pattern";

import { AbsolutePathSchema } from "../../validation/path/customTypes/index.js";
import { ConfigResourceFileSchema } from "../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import { TemplateResourceFileSchema } from "../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import { WorkspaceContextSchema } from "../../validation/workspaceContext/schemas/workspaceContext.js";
import {
  initializeResourceContext,
  loadResource,
  type ResourceContextState,
  type ResourceContextAddResourceOperation,
  type ResourceContextMutationFnResult,
} from "./state.js";

// Mini-mutation testing framework

type MutationTestCaseFactory<
  StateFactory extends () => any,
  SequenceItemFactory extends (arg: any) => any,
  ProcessSequenceItem extends (
    arg: ReturnType<SequenceItemFactory>,
    state: ReturnType<StateFactory>,
  ) => void | Promise<void>,
> = (sequenceItemInputs: Parameters<SequenceItemFactory>[0][]) => {
  initState: StateFactory;
  sequence: ReturnType<SequenceItemFactory>[];
  processSequenceItem: ProcessSequenceItem;
};

const createMutationTestCaseFactory = <
  StateFactory extends () => any,
  SequenceItemFactory extends (arg: any) => any,
  ProcessSequenceItem extends (
    arg: ReturnType<SequenceItemFactory>,
    state: ReturnType<StateFactory>,
  ) => void | Promise<void>,
>(
  initState: StateFactory,
  sequenceItemFactory: SequenceItemFactory,
  processSequenceItem: ProcessSequenceItem,
): MutationTestCaseFactory<StateFactory, SequenceItemFactory, ProcessSequenceItem> => {
  const factory: MutationTestCaseFactory<StateFactory, SequenceItemFactory, ProcessSequenceItem> = (
    sequenceItemInputs,
  ) => {
    return {
      initState,
      sequence: sequenceItemInputs.map(sequenceItemFactory),
      processSequenceItem,
    };
  };
  return factory;
};

const runMutationTestCase = async <
  StateFactory extends () => any,
  SequenceItemFactory extends (arg: any) => any,
  ProcessSequenceItem extends (
    arg: ReturnType<SequenceItemFactory>,
    state: ReturnType<StateFactory>,
  ) => void | Promise<void>,
>(
  testCase: ReturnType<
    MutationTestCaseFactory<StateFactory, SequenceItemFactory, ProcessSequenceItem>
  >,
): Promise<void> => {
  const { initState, processSequenceItem, sequence } = testCase;
  const state = initState();
  for (const sequenceItem of sequence) {
    await processSequenceItem(sequenceItem, state);
  }
};

// Mini-mutation testing framework end

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

type LoadResourceMutation =
  | {
      type: "mutationWithOptionalAssertion";
      operationInput: ResourceContextAddResourceOperation;
      // optional
      assertOperationResult?: (
        result: Ok<ResourceContextMutationFnResult, never> | Err<any, any>,
      ) => any;
    }
  | {
      type: "stateAssertion";
      assertState: (state: ResourceContextState) => any;
    };

// Todo - adjust this factory if necessary
const loadResourceOperationFactory = (operation: LoadResourceMutation): LoadResourceMutation => {
  return operation;
};

const loadResourceTestCaseFactory = createMutationTestCaseFactory(
  () => initializeResourceContext(workspaceContext).getState(),
  loadResourceOperationFactory,
  async (sequenceItem, initialState) => {
    await match(sequenceItem)
      .with({ type: "mutationWithOptionalAssertion" }, async (value) => {
        const mutationResult = await loadResource(initialState, value.operationInput);
        if (mutationResult.isOk()) {
          assert.strictEqual(
            mutationResult.value.state,
            initialState,
            'expected state to hold same reference as before "loadResource" (immutable update detected)',
          );
        }
        if (value.assertOperationResult !== undefined) {
          value.assertOperationResult(mutationResult);
        }
      })
      .with({ type: "stateAssertion" }, (value) => {
        value.assertState(initialState);
      })
      .exhaustive();
  },
);

const testCasesForConfigResourceFileFromInput = [
  {
    testInput: {
      data: loadResourceTestCaseFactory([
        {
          type: "mutationWithOptionalAssertion",
          operationInput: {
            type: "configResource",
            configResourceType: "workflow",
            file: await ConfigResourceFileSchema.parseAsync({
              format: "yaml",
              path: join(workspaceContext, "workflows/test-workflow.yml"),
            }),
          },
          assertOperationResult(result) {
            assert.strictEqual(result.isOk(), true, "expected successful result");
            if (result.isOk()) {
              assert.strictEqual(
                result.value.enqueuedOperations.length,
                1,
                "expected result to contain 1 enqueued operation",
              );
            }
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            assert.strictEqual(
              state.resources.configResources.workflows.size,
              1,
              "expected 1 workflow to be loaded",
            );
            assert.strictEqual(
              state.resources.templateResources.templates.size,
              0,
              "expected rest of the state not to be polluted",
            );
          },
        },
        {
          type: "mutationWithOptionalAssertion",
          operationInput: {
            type: "configResource",
            configResourceType: "workflow",
            file: await ConfigResourceFileSchema.parseAsync({
              format: "yaml",
              path: join(workspaceContext, "workflows/test-workflow.yml"),
            }),
          },
          assertOperationResult(result) {
            assert.strictEqual(result.isOk(), true, "expected successful result");
            if (result.isOk()) {
              assert.strictEqual(
                result.value.enqueuedOperations.length,
                0,
                "expected result to contain 0 enqueued operations",
              );
            }
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            assert.strictEqual(
              state.resources.configResources.workflows.size,
              1,
              "expected 1 workflow to be loaded",
            );
            assert.strictEqual(
              state.resources.templateResources.templates.size,
              0,
              "expected rest of the state not to be polluted",
            );
          },
        },
      ]),
      testCaseDescription: "repeated load of workflow resource",
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should have only 1 loaded workflow",
    },
  },
  {
    testInput: {
      data: loadResourceTestCaseFactory([
        {
          type: "mutationWithOptionalAssertion",
          operationInput: {
            type: "templateResource",
            file: await TemplateResourceFileSchema.parseAsync({
              format: "handlebars",
              path: join(workspaceContext, "templates/test-template.hbs"),
            }),
          },
          assertOperationResult(result) {
            assert.strictEqual(result.isOk(), true, "expected successful result");
            if (result.isOk()) {
              assert.strictEqual(
                result.value.enqueuedOperations.length,
                0,
                "expected result to contain 0 enqueued operations",
              );
            }
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            assert.strictEqual(
              state.resources.templateResources.templates.size,
              1,
              "expected 1 template to be loaded",
            );
            assert.strictEqual(
              state.resources.configResources.workflows.size,
              0,
              "expected rest of the state not to be polluted",
            );
          },
        },
        {
          type: "mutationWithOptionalAssertion",
          operationInput: {
            type: "templateResource",
            file: await TemplateResourceFileSchema.parseAsync({
              format: "handlebars",
              path: join(workspaceContext, "templates/test-template.hbs"),
            }),
          },
          assertOperationResult(result) {
            assert.strictEqual(result.isOk(), true, "expected successful result");
            if (result.isOk()) {
              assert.strictEqual(
                result.value.enqueuedOperations.length,
                0,
                "expected result to contain 0 enqueued operations",
              );
            }
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            assert.strictEqual(
              state.resources.templateResources.templates.size,
              1,
              "expected 1 template to be loaded",
            );
            assert.strictEqual(
              state.resources.configResources.workflows.size,
              0,
              "expected rest of the state not to be polluted",
            );
          },
        },
      ]),
      testCaseDescription: "repeated load of workflow resource",
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should have only 1 loaded workflow",
    },
  },
] satisfies {
  testInput: {
    data: ReturnType<typeof loadResourceTestCaseFactory>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: null;
    testBehaviourDescription: string;
  };
}[];

describe("state - loadResource", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceFileFromInput) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      await runMutationTestCase(testInput.data);
    });
  }
});
