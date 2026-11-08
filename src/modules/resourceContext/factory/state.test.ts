import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Err, Ok } from "neverthrow";
import { match } from "ts-pattern";

import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import { ConfigResourceFileSchema } from "../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import { TemplateResourceFileSchema } from "../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import { TermResourceFileSchema } from "../../../validation/resourceFile/term/codecs/resourceAbsolutePathToResourceFile.js";
import { WorkspaceContextSchema } from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import {
  initializeResourceContext,
  loadResource,
  type ResourceContextState,
  type ResourceContextAddResourceOperation,
  type ResourceContextMutationFnResult,
} from "./state.js";

// Mini-mutation testing framework

type MutationTestCaseFactory<
  StateFactory extends (arg?: any) => any,
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
  StateFactory extends (arg?: any) => any,
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
  StateFactory extends (arg?: any) => any,
  SequenceItemFactory extends (arg: any) => any,
  ProcessSequenceItem extends (
    arg: ReturnType<SequenceItemFactory>,
    state: ReturnType<StateFactory>,
  ) => void | Promise<void>,
>(
  stateDependencies: Parameters<StateFactory>[0],
  testCase: ReturnType<
    MutationTestCaseFactory<StateFactory, SequenceItemFactory, ProcessSequenceItem>
  >,
): Promise<void> => {
  const { initState, processSequenceItem, sequence } = testCase;
  const state = initState(stateDependencies);
  for (const sequenceItem of sequence) {
    await processSequenceItem(sequenceItem, state);
  }
};

// Mini-mutation testing framework end

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
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
          expect(
            mutationResult.value.state,
            'expected state to hold same reference as before "loadResource" (immutable update detected)',
          ).toBe(initialState);
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
            assert.ok(result.isOk(), "expected successful result");
            expect(
              result.value.enqueuedOperations.length,
              "expected result to contain 1 enqueued operation",
            ).toBe(1);
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            expect(
              state.resources.configResources.workflows.size,
              "expected 1 workflow to be loaded",
            ).toBe(1);
            expect(
              state.resources.templateResources.templates.size,
              "expected rest of the state not to be polluted",
            ).toBe(0);
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
            assert.ok(result.isOk(), "expected successful result");
            expect(
              result.value.enqueuedOperations.length,
              "expected result to contain 0 enqueued operations",
            ).toBe(0);
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            expect(
              state.resources.configResources.workflows.size,
              "expected 1 workflow to be loaded",
            ).toBe(1);
            expect(
              state.resources.templateResources.templates.size,
              "expected rest of the state not to be polluted",
            ).toBe(0);
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
            assert.ok(result.isOk(), "expected successful result");
            expect(
              result.value.enqueuedOperations.length,
              "expected result to contain 0 enqueued operations",
            ).toBe(0);
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            expect(
              state.resources.templateResources.templates.size,
              "expected 1 template to be loaded",
            ).toBe(1);
            expect(
              state.resources.configResources.workflows.size,
              "expected rest of the state not to be polluted",
            ).toBe(0);
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
            assert.ok(result.isOk(), "expected successful result");
            expect(
              result.value.enqueuedOperations.length,
              "expected result to contain 0 enqueued operations",
            ).toBe(0);
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            expect(
              state.resources.templateResources.templates.size,
              "expected 1 template to be loaded",
            ).toBe(1);
            expect(
              state.resources.configResources.workflows.size,
              "expected rest of the state not to be polluted",
            ).toBe(0);
          },
        },
      ]),
      testCaseDescription: "repeated load of template resource",
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should have only 1 loaded template",
    },
  },
  {
    testInput: {
      data: loadResourceTestCaseFactory([
        {
          type: "mutationWithOptionalAssertion",
          operationInput: {
            type: "termResource",
            file: await TermResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "terms/test-term-nested.json"),
              selector: [0, "someAttribute"],
            }),
            valueType: "string",
          },
          assertOperationResult(result) {
            assert.ok(result.isOk(), "expected successful result");
            expect(
              result.value.enqueuedOperations.length,
              "expected result to contain 0 enqueued operations",
            ).toBe(0);
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            expect(state.resources.termResources.terms.size, "expected 1 term to be loaded").toBe(
              1,
            );
            expect(
              state.resources.configResources.workflows.size,
              "expected rest of the state not to be polluted",
            ).toBe(0);
          },
        },
        {
          type: "mutationWithOptionalAssertion",
          operationInput: {
            type: "termResource",
            file: await TermResourceFileSchema.parseAsync({
              format: "json",
              path: join(workspaceContext, "terms/test-term-nested.json"),
              selector: [0, "someAttribute"],
            }),
            valueType: "string",
          },
          assertOperationResult(result) {
            assert.ok(result.isOk(), "expected successful result");
            expect(
              result.value.enqueuedOperations.length,
              "expected result to contain 0 enqueued operations",
            ).toBe(0);
          },
        },
        {
          type: "stateAssertion",
          assertState(state) {
            expect(state.resources.termResources.terms.size, "expected 1 term to be loaded").toBe(
              1,
            );
            expect(
              state.resources.configResources.workflows.size,
              "expected rest of the state not to be polluted",
            ).toBe(0);
          },
        },
      ]),
      testCaseDescription: "repeated load of template resource",
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should have only 1 loaded term",
    },
  },
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
              path: join(workspaceContext, "workflows/test-workflow-with-term-reference.yml"),
            }),
          },
          assertOperationResult(result) {
            assert.ok(result.isOk(), "expected successful result");
            expect(
              result.value.enqueuedOperations.length,
              "expected result to contain 2 enqueued operation",
            ).toBe(2);
            expect(
              result.value.enqueuedOperations.length,
              "expected result to contain 2 enqueued operations",
            ).toBe(2);
            expect(
              result.value.enqueuedOperations.map(({ type }) => type),
              "expected result to contain enqueued operations for template and term",
            ).toEqual(["templateResource", "termResource"]);
          },
        },
      ]),
      testCaseDescription: "workflow with term references",
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should enqueue encountered term resources",
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
      await runMutationTestCase(undefined, testInput.data);
    });
  }
});
