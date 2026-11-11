import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";

import { expectTypeOf } from "expect-type";
import { match } from "ts-pattern";

import type { TemplateVariableSpecs } from "../factories/factory.js";
import {
  templateVariableSpecsBuildZodSchema,
  templateVariableSpecToZodSchema,
} from "./buildZodSchema.js";

const testCasesForTemplateVariableSpecToZodSchema = [
  {
    testInput: {
      data: {
        specs: {
          specType: "primitive",
          variableType: "boolean",
          modifier: { modifierType: "none" },
        },
        zodSchemaInput: true,
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "primitive boolean template specs",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse boolean value",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "primitive",
          variableType: "boolean",
          modifier: { modifierType: "optional" },
        },
        zodSchemaInput: undefined,
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "primitive optional boolean template specs",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse boolean value",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "primitive",
          variableType: "boolean",
          modifier: { modifierType: "optionalWithDefault", defaultValue: false },
        },
        zodSchemaInput: undefined,
        assertion: {
          type: "strictEqualsLiteral",
          literal: false,
        },
      },
      testCaseDescription: "primitive optional boolean template specs",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse boolean value",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "primitive",
          variableType: "number",
          modifier: { modifierType: "none" },
        },
        zodSchemaInput: 13,
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "primitive numeric template specs",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse numeric value",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "primitive",
          variableType: "number",
          modifier: { modifierType: "optional" },
        },
        zodSchemaInput: undefined,
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "primitive numeric template specs",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse numeric value",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "primitive",
          variableType: "number",
          modifier: { modifierType: "optionalWithDefault", defaultValue: 15 },
        },
        zodSchemaInput: undefined,
        assertion: {
          type: "strictEqualsLiteral",
          literal: 15,
        },
      },
      testCaseDescription: "primitive numeric template specs",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse numeric value",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "primitive",
          variableType: "string",
          modifier: { modifierType: "none" },
        },
        zodSchemaInput: "string",
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "primitive string template specs",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse string value",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "composite",
          variableType: "array",
          arrayElementType: {
            specType: "primitive",
            variableType: "string",
            modifier: { modifierType: "none" },
          },
          modifier: { modifierType: "none" },
        },
        zodSchemaInput: ["input1", "input2"],
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "composite array of strings",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "composite",
          variableType: "array",
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
          modifier: { modifierType: "none" },
        },
        zodSchemaInput: [["input1", "input2"], ["input3"]],
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "composite nested array of strings",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "composite",
          variableType: "array",
          arrayElementType: {
            specType: "primitive",
            variableType: "string",
            modifier: { modifierType: "none" },
          },
          modifier: { modifierType: "optional" },
        },
        zodSchemaInput: undefined,
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "composite optional array of strings",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse",
    },
  },
  {
    testInput: {
      data: {
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            key1: {
              specType: "primitive",
              variableType: "boolean",
              modifier: {
                modifierType: "none",
              },
            },
            key2: {
              specType: "primitive",
              variableType: "number",
              modifier: {
                modifierType: "none",
              },
            },
            key3: {
              specType: "primitive",
              variableType: "string",
              modifier: {
                modifierType: "none",
              },
            },
            arrayAttribute: {
              specType: "composite",
              variableType: "array",
              arrayElementType: {
                specType: "primitive",
                variableType: "number",
                modifier: {
                  modifierType: "none",
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
            nestedObjectAttribute: {
              specType: "composite",
              variableType: "object",
              objectShapeType: {
                nestedKey1: {
                  specType: "primitive",
                  variableType: "boolean",
                  modifier: {
                    modifierType: "none",
                  },
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
            nestedOptionalObjectAttribute: {
              specType: "composite",
              variableType: "object",
              objectShapeType: {
                nestedOptionalKey1: {
                  specType: "primitive",
                  variableType: "boolean",
                  modifier: {
                    modifierType: "optional",
                  },
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: { modifierType: "none" },
        },
        zodSchemaInput: {
          key1: true,
          key2: 2,
          key3: "test",
          arrayAttribute: [1, 2, 3],
          nestedObjectAttribute: {
            nestedKey1: false,
          },
          nestedOptionalObjectAttribute: {},
        },
        assertion: {
          type: "deepEqualsInput",
        },
      },
      testCaseDescription: "object with mixed and nested values",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse",
    },
  },
] satisfies {
  testInput: {
    data: {
      specs: TemplateVariableSpecs;
      zodSchemaInput: any;
      assertion:
        | {
            type: "deepEqualsInput";
          }
        | {
            type: "strictEqualsLiteral";
            literal: any;
          };
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: boolean;
    };
    testBehaviourDescription: string;
  };
}[];

describe("templateVariableSpecToZodSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateVariableSpecToZodSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const builtZodSchema = templateVariableSpecToZodSchema(testInput.data.specs);
      const parseResult = builtZodSchema.safeParse(testInput.data.zodSchemaInput);
      if (testOutcome.data.result === true) {
        assert.ok(parseResult.success);
        match(testInput.data.assertion)
          .with({ type: "deepEqualsInput" }, () => {
            expect(parseResult.data).toEqual(testInput.data.zodSchemaInput);
          })
          .with({ type: "strictEqualsLiteral" }, (strictEqualsLiteralAssertion) => {
            expect(parseResult.data).toBe(strictEqualsLiteralAssertion.literal);
          })
          .exhaustive();
      }
    });
  }
});

// Simple type inferrence test
const exampleSpec = {
  specType: "composite",
  variableType: "array",
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
  modifier: { modifierType: "none" },
} satisfies TemplateVariableSpecs;

expectTypeOf(() => templateVariableSpecToZodSchema(exampleSpec).parse([["input"]])).toEqualTypeOf<
  () => string[][]
>();

const testCasesForTemplateVariableSpecsBuildZodSchema = [
  {
    testInput: {
      data: {
        variableSpecs: {
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
        },
        zodSchemaInput: {
          nestedStringArrayVariable: [["string"]],
        },
      },
      testCaseDescription: "template context parser containing nested string array",
    },
    testOutcome: {
      data: {
        result: true,
      },
      testBehaviourDescription: "should successfully parse",
    },
  },
] satisfies {
  testInput: {
    data: {
      variableSpecs: Record<string, TemplateVariableSpecs>;
      zodSchemaInput: object;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      result: boolean;
    };
    testBehaviourDescription: string;
  };
}[];

describe("templateVariableSpecsBuildZodSchema", () => {
  for (const { testInput, testOutcome } of testCasesForTemplateVariableSpecsBuildZodSchema) {
    it(`for ${testInput.testCaseDescription} it ${testOutcome.testBehaviourDescription}`, async () => {
      const builtZodSchema = templateVariableSpecsBuildZodSchema(testInput.data.variableSpecs);
      const parseResult = builtZodSchema.safeParse(testInput.data.zodSchemaInput);
      if (testOutcome.data.result === true) {
        assert.ok(parseResult.success);
        expect(parseResult.data).toEqual(testInput.data.zodSchemaInput);
      }
    });
  }
});

// Simple type inferrence test
const exampleSpecs = {
  nestedArrayVariable: {
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

expectTypeOf(() =>
  templateVariableSpecsBuildZodSchema(exampleSpecs).parse({ nestedArrayVariable: [["input"]] }),
).toEqualTypeOf<() => { nestedArrayVariable: string[][] }>();
