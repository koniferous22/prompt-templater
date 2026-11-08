import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";

import type { Err, Ok, Result } from "neverthrow";
import { match } from "ts-pattern";

import type { AppError } from "../../../utils/deps/neverthrow/types.js";
import { createResourceContextFromExplicitWorkspace } from "../../resourceContext/createResourceContextFromExplicitWorkspace.js";
import type {
  TemplateVariableSpecObjectComposite,
  TemplateVariableSpecs,
} from "../../templateVariableSpecs/factories/factory.js";
import { templateVariableSpecsBuildZodSchema } from "../../templateVariableSpecs/methods/buildZodSchema.js";
import {
  createTemplateVariableContext,
  type InferOptionalValues,
  type InferTemplateContextStateFromSpecs,
  type InferValues,
} from "./factory.js";

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

type TemplateVariableContextMutation<VariableSpecs extends Record<string, TemplateVariableSpecs>> =
  | {
      type: "mutationWithOptionalAssertion";
      operationInput: {
        key: keyof VariableSpecs;
        value: any;
      };
      // optional
      assertOperationResult?: (
        result:
          | Ok<InferTemplateContextStateFromSpecs<VariableSpecs>, never>
          | Err<
              any,
              | AppError<"module_templateVariableContext_setValue_keyNotFound">
              | AppError<"module_templateVariableContext_setValue_invalidValueType">
            >,
      ) => any;
    }
  | {
      type: "resolvedValuesAssertion";
      assertResolvedValues: (state: InferOptionalValues<VariableSpecs>) => any;
    }
  | {
      // Note - "strict" in sense of method naming "resolveValuesStrict"
      type: "resolvedValuesStrictAssertion";
      assertResolvedValuesStrict: (result: Result<InferValues<VariableSpecs>, any>) => any;
    };

// Todo - adjust this factory if necessary
const templateVariableContextMutationFactory = <
  VariableSpecs extends Record<string, TemplateVariableSpecs>,
>(
  operation: TemplateVariableContextMutation<VariableSpecs>,
): TemplateVariableContextMutation<VariableSpecs> => {
  return operation;
};

const templateVariableContextTestCaseFactory = createMutationTestCaseFactory(
  (specs: Record<string, TemplateVariableSpecs>) =>
    createTemplateVariableContext(specs, templateVariableSpecsBuildZodSchema(specs).def.shape),
  templateVariableContextMutationFactory,
  async (sequenceItem, initialState) => {
    await match(sequenceItem)
      .with({ type: "mutationWithOptionalAssertion" }, async (value) => {
        const mutationResult = initialState.setValue(
          value.operationInput.key,
          // @ts-expect-error
          value.operationInput.value,
        );
        if (value.assertOperationResult !== undefined) {
          value.assertOperationResult(mutationResult);
        }
      })
      .with({ type: "resolvedValuesAssertion" }, (value) => {
        value.assertResolvedValues(initialState.resolveValues());
      })
      .with({ type: "resolvedValuesStrictAssertion" }, (value) => {
        value.assertResolvedValuesStrict(initialState.resolveValuesStrict());
      })
      .exhaustive();
  },
);

const templateVariableSpecsFixture1 = {
  booleanVariable: {
    specType: "primitive",
    variableType: "boolean",
    modifier: { modifierType: "none" },
  },
  numericVariable: {
    specType: "primitive",
    variableType: "number",
    modifier: { modifierType: "none" },
  },
  stringVariable: {
    specType: "primitive",
    variableType: "string",
    modifier: { modifierType: "none" },
  },
  nestedStringArrayVariable: {
    specType: "composite",
    variableType: "array",
    modifier: { modifierType: "none" },
    arrayElementType: {
      specType: "composite",
      variableType: "array",
      modifier: { modifierType: "none" },
      arrayElementType: {
        specType: "primitive",
        variableType: "string",
        modifier: { modifierType: "none" },
      },
    },
  },
} satisfies Record<string, TemplateVariableSpecs>;

const testCasesForCreateTemplateVariableContext = [
  {
    testInput: {
      testCaseDescription: "setting invalid variable name",
      data: {
        templateSpecs: templateVariableSpecsFixture1,
        mutationTestingData: templateVariableContextTestCaseFactory([
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "notARealVariable",
              value: "notARealValue",
            },
            assertOperationResult(result) {
              assert.ok(result.isErr(), "expected error result");
              expect(
                result.error.code,
                "expected error code denoting invalid setting invalid key",
              ).toBe("module_templateVariableContext_setValue_keyNotFound");
            },
          },
        ]),
      },
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should fail with correct error code",
    },
  },
  {
    testInput: {
      testCaseDescription: "setting invalid value in template variable context",
      data: {
        templateSpecs: templateVariableSpecsFixture1,
        mutationTestingData: templateVariableContextTestCaseFactory([
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "booleanVariable",
              value: "notABooleanValue",
            },
            assertOperationResult(result) {
              assert.ok(result.isErr(), "expected error result");
              expect(
                result.error.code,
                "expected error code denoting invalid setting invalid value type",
              ).toBe("module_templateVariableContext_setValue_invalidValueType");
            },
          },
        ]),
      },
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should fail with correct error code",
    },
  },
  {
    testInput: {
      testCaseDescription: "partially resolved template variable context",
      data: {
        templateSpecs: templateVariableSpecsFixture1,
        mutationTestingData: templateVariableContextTestCaseFactory([
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "booleanVariable",
              value: true,
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "numericVariable",
              value: 5,
            },
          },
          {
            type: "resolvedValuesStrictAssertion",
            assertResolvedValuesStrict(result) {
              assert.ok(result.isErr(), "expected error result");
              expect(
                result.error.code,
                "expected error code denoting invalid setting invalid value type",
              ).toBe("module_templateVariableContext_resolveValuesStrict_unintializedState");
            },
          },
          {
            type: "resolvedValuesAssertion",
            assertResolvedValues(optionalValues) {
              expect(optionalValues).toEqual({
                booleanVariable: true,
                numericVariable: 5,
                stringVariable: undefined,
                nestedStringArrayVariable: undefined,
              } as any);
            },
          },
        ]),
      },
    },
    testOutcome: {
      data: null,
      testBehaviourDescription:
        "should fail on strict resolve and return partial object with resolve",
    },
  },
  {
    testInput: {
      testCaseDescription: "fully resolved template variable context",
      data: {
        templateSpecs: templateVariableSpecsFixture1,
        mutationTestingData: templateVariableContextTestCaseFactory([
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "booleanVariable",
              value: true,
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "numericVariable",
              value: 5,
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "stringVariable",
              value: "stringValue",
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "nestedStringArrayVariable",
              value: [["string1", "string2"], ["string3"]],
            },
          },
          {
            type: "resolvedValuesStrictAssertion",
            assertResolvedValuesStrict(result) {
              if (!result.isOk()) {
                console.error(result.error);
              }
              assert.ok(result.isOk(), "expected ok result");
              expect(result.value).toEqual({
                booleanVariable: true,
                numericVariable: 5,
                stringVariable: "stringValue",
                nestedStringArrayVariable: [["string1", "string2"], ["string3"]],
              } as any);
            },
          },
          {
            type: "resolvedValuesAssertion",
            assertResolvedValues(optionalValues) {
              expect(optionalValues).toEqual({
                booleanVariable: true,
                numericVariable: 5,
                stringVariable: "stringValue",
                nestedStringArrayVariable: [["string1", "string2"], ["string3"]],
              } as any);
            },
          },
        ]),
      },
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should succeed on both strict resolve and resolve methods",
    },
  },
  {
    testInput: {
      testCaseDescription: "template variable context with overwrites",
      data: {
        templateSpecs: templateVariableSpecsFixture1,
        mutationTestingData: templateVariableContextTestCaseFactory([
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "booleanVariable",
              value: true,
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "numericVariable",
              value: 5,
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "stringVariable",
              value: "stringValue",
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "nestedStringArrayVariable",
              value: [["string1", "string2"], ["string3"]],
            },
          },
          {
            type: "resolvedValuesStrictAssertion",
            assertResolvedValuesStrict(result) {
              if (!result.isOk()) {
                console.error(result.error);
              }
              assert.ok(result.isOk(), "expected ok result");
              expect(result.value).toEqual({
                booleanVariable: true,
                numericVariable: 5,
                stringVariable: "stringValue",
                nestedStringArrayVariable: [["string1", "string2"], ["string3"]],
              } as any);
            },
          },
          {
            type: "resolvedValuesAssertion",
            assertResolvedValues(optionalValues) {
              expect(optionalValues).toEqual({
                booleanVariable: true,
                numericVariable: 5,
                stringVariable: "stringValue",
                nestedStringArrayVariable: [["string1", "string2"], ["string3"]],
              } as any);
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "booleanVariable",
              value: false,
            },
          },
          {
            type: "mutationWithOptionalAssertion",
            operationInput: {
              key: "numericVariable",
              value: 6,
            },
          },
          {
            type: "resolvedValuesStrictAssertion",
            assertResolvedValuesStrict(result) {
              assert.ok(result.isOk(), "expected ok result");
              expect(result.value).toEqual({
                booleanVariable: false,
                numericVariable: 6,
                stringVariable: "stringValue",
                nestedStringArrayVariable: [["string1", "string2"], ["string3"]],
              } as any);
            },
          },
          {
            type: "resolvedValuesAssertion",
            assertResolvedValues(optionalValues) {
              expect(optionalValues).toEqual({
                booleanVariable: false,
                numericVariable: 6,
                stringVariable: "stringValue",
                nestedStringArrayVariable: [["string1", "string2"], ["string3"]],
              } as any);
            },
          },
        ]),
      },
    },
    testOutcome: {
      data: null,
      testBehaviourDescription: "should reflect",
    },
  },
] satisfies {
  testInput: {
    data: {
      templateSpecs: Record<string, TemplateVariableSpecs>;
      mutationTestingData: ReturnType<typeof templateVariableContextTestCaseFactory>;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: null;
    testBehaviourDescription: string;
  };
}[];

describe("createTemplateVariableContext", () => {
  for (const { testInput, testOutcome } of testCasesForCreateTemplateVariableContext) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      await runMutationTestCase(testInput.data.templateSpecs, testInput.data.mutationTestingData);
    });
  }
});
