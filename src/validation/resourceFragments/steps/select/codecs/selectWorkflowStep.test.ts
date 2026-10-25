import assert from "node:assert";
import { describe, it } from "node:test";

import z from "zod";

import { NonNegativeIntegerSchema } from "../../../../number/customTypes/number.js";
import { AbsolutePathSchema, RelativePathSchema } from "../../../../path/customTypes/index.js";
import {
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../../../path/schemas/pathWithExtension.js";
import { NonEmptyStringToTermResourceReferenceSchema } from "../../../../resourceReference/term/codecs/nonEmptyStringToResourceReference.js";
import { PlainFileTermReferenceOptionsInputSchema } from "../../../../resourceReference/term/schemas/plainFileReferenceOptions.js";
import { TermResourceReferenceSchema } from "../../../../resourceReference/term/schemas/termResourceReference.js";
import { NonEmptyStringSchema } from "../../../../string/customTypes/string.js";
import { SelectWorkflowStepSchema } from "./selectWorkflowStep.js";

const testCasesForSelectWorkflowStepSchema = [
  // Reference shorthand for choices - test cases
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: "/absolute/path/to/term.json",
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting reference string with absolute .json path",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: NonEmptyStringToTermResourceReferenceSchema.parse(
              "/absolute/path/to/term.json",
            ),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: "path/to/term.json",
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting reference string with relative .json path",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: NonEmptyStringToTermResourceReferenceSchema.parse("path/to/term.json"),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: "/absolute/path/to/term.yml",
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting reference string with absolute .yaml path",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: NonEmptyStringToTermResourceReferenceSchema.parse(
              "/absolute/path/to/term.yml",
            ),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: "path/to/term.yml",
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting reference string with relative .yaml path",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: NonEmptyStringToTermResourceReferenceSchema.parse("path/to/term.yml"),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: "/absolute/path/to/term.txt",
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting reference string with absolute plaintext path",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: NonEmptyStringToTermResourceReferenceSchema.parse(
              "/absolute/path/to/term.txt",
            ),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: "path/to/term.txt",
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting reference string with relative plaintext path",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: NonEmptyStringToTermResourceReferenceSchema.parse("path/to/term.txt"),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  // Literal shorthand for choices - test cases - boolean
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "boolean",
        choices: true,
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting single boolean literal",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "boolean",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "boolean",
              values: [true],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "boolean",
        choices: [true, false],
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting array of boolean literals",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "boolean",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "boolean",
              values: [true, false],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "boolean",
        choices: { true: "label for true", false: "label for false" },
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting record with boolean literal keys",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "boolean",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "boolean",
              values: {
                true: NonEmptyStringSchema.parse("label for true"),
                false: NonEmptyStringSchema.parse("label for false"),
              },
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: [true, false],
      },
      testCaseDescription:
        "select workflow step, with boolean array literal choices having incompatible default value type string",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: { true: "label for true", false: "label for false" },
      },
      testCaseDescription:
        "select workflow step, with boolean record literal choices having incompatible default value type string",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("true")]: NonEmptyStringSchema.parse("label for true"),
                [NonEmptyStringSchema.parse("false")]:
                  NonEmptyStringSchema.parse("label for false"),
              },
            },
          },
        },
      },
      testBehaviourDescription:
        "succeed as an egde-case, with boolean keys being treated as strings",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: { true: "label for true", notBoolean: "label for notBoolean" },
      },
      testCaseDescription:
        "select workflow step, with boolean literal choices having incompatible record keys",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: [true, "notBoolean"],
      },
      testCaseDescription:
        "select workflow step, with boolean literal choices having incompatible array values",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  // Literal shorthand for choices - test cases - number
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: 5,
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting single numeric literal",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "number",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "number",
              values: [5],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: [3, 5],
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting array of numeric literals",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "number",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "number",
              values: [3, 5],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: { 3: "label for 3", 5: "label for 5" },
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting record with numeric literal keys",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "number",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "number",
              values: {
                3: NonEmptyStringSchema.parse("label for 3"),
                5: NonEmptyStringSchema.parse("label for 5"),
              },
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: [3, 5],
      },
      testCaseDescription:
        "select workflow step, with numeric array literal choices having incompatible default value type string",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: { 3: "label for 3", 5: "label for 5" },
      },
      testCaseDescription:
        "select workflow step, with numeric record literal choices having incompatible default value type string",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("3")]: NonEmptyStringSchema.parse("label for 3"),
                [NonEmptyStringSchema.parse("5")]: NonEmptyStringSchema.parse("label for 5"),
              },
            },
          },
        },
      },
      testBehaviourDescription:
        "succeed as an egde-case, with numeric keys being treated as strings",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: { 3: "label for true", notNumber: "label for notNumber" },
      },
      testCaseDescription:
        "select workflow step, with numeric literal choices having incompatible record keys",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: [3, "notNumber"],
      },
      testCaseDescription:
        "select workflow step, with numeric literal choices having incompatible array values",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  // Literal shorthand for choices - test cases - string
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "string",
        choices: "single-string-literal",
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting single string literal",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: TermResourceReferenceSchema.parse({
              type: "relative",
              filePath: {
                format: "plaintext",
                path: RelativePathSchema.parse("single-string-literal"),
                options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
              },
            }),
          },
        },
      },
      testBehaviourDescription:
        "succeed as edge-case, interpreting the string as relative path plaintext reference",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "string",
        choices: ["string1", "string2"],
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting array of string literals",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "string",
              values: [
                NonEmptyStringSchema.parse("string1"),
                NonEmptyStringSchema.parse("string2"),
              ],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "string",
        choices: { string1: "label for string1", string2: "label for string2" },
      },
      testCaseDescription:
        "select workflow step, with choices shorthand denoting record with string literal keys",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("string1")]:
                  NonEmptyStringSchema.parse("label for string1"),
                [NonEmptyStringSchema.parse("string2")]:
                  NonEmptyStringSchema.parse("label for string2"),
              },
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: ["string1", "string2"],
      },
      testCaseDescription:
        "select workflow step, with string array literal choices having compatible default value type string",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "string",
              values: [
                NonEmptyStringSchema.parse("string1"),
                NonEmptyStringSchema.parse("string2"),
              ],
            },
          },
        },
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: { string1: "label for string1", string2: "label for string2" },
      },
      testCaseDescription:
        "select workflow step, with string record literal choices having compatible default value type string",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("string1")]:
                  NonEmptyStringSchema.parse("label for string1"),
                [NonEmptyStringSchema.parse("string2")]:
                  NonEmptyStringSchema.parse("label for string2"),
              },
            },
          },
        },
      },
      testBehaviourDescription:
        "succeed as an egde-case, with numeric keys being treated as strings",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "string",
        choices: { string1: "label for string1", 3: "label for 3" },
      },
      testCaseDescription:
        "select workflow step, with string literal choices having incompatible record keys",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("string1")]:
                  NonEmptyStringSchema.parse("label for string1"),
                [NonEmptyStringSchema.parse("3")]: NonEmptyStringSchema.parse("label for 3"),
              },
            },
          },
        },
      },
      testBehaviourDescription:
        "succeed as an egde-case, with numeric keys being treated as strings",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "string",
        choices: ["string1", 3],
      },
      testCaseDescription:
        "select workflow step, with string literal choices having incompatible array values",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  // Test cases for full object without choices shorthands - target variable null
  {
    testInput: {
      data: {
        id: "selectStepId",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "literal",
          values: ["string1", "string2"],
        },
      },
      testCaseDescription: "select workflow step, without target variable specified",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "string",
              values: [
                NonEmptyStringSchema.parse("string1"),
                NonEmptyStringSchema.parse("string2"),
              ],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  // Test cases for full object without choices shorthands - wrong workflow step type
  {
    testInput: {
      data: {
        id: "selectStepId",
        // @ts-expect-error for sake of test
        type: "checkbox",
        message: "Pick an option",
        choices: {
          type: "literal",
          values: ["string1", "string2"],
        },
      },
      testCaseDescription: 'workflow step with incorrect type (i.e. not "select")',
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  // Test cases for full object without choices shorthands - verbose boolean literals
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "boolean",
        choices: {
          type: "literal",
          values: [true, false],
        },
      },
      testCaseDescription:
        "select workflow step, with explicit literal choices having boolean type",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "boolean",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "boolean",
              values: [true, false],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "literal",
          values: [true, false],
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with array of boolean literals having incompatible default value type string",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "literal",
          values: { true: "label for true", false: "label for false" },
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with record with boolean literals having incompatible default value type string",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("true")]: NonEmptyStringSchema.parse("label for true"),
                [NonEmptyStringSchema.parse("false")]:
                  NonEmptyStringSchema.parse("label for false"),
              },
            },
          },
        },
      },
      testBehaviourDescription:
        "succeed as an egde-case, with boolean keys being treated as strings",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: { true: "label for true", notBoolean: "label for notBoolean" },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with record with boolean literals having incompatible record keys",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: [true, "notBoolean"],
      },
      testCaseDescription:
        "select workflow step, with explicit choices with array of boolean literals having incompatible array values",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  // Test cases for full object without choices shorthands - verbose numeric literals
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: {
          type: "literal",
          values: [3, 5],
        },
      },
      testCaseDescription: "select workflow step, with explicit literal choices having number type",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "number",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "number",
              values: [3, 5],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "literal",
          values: [3, 5],
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with array of numeric literals having incompatible default value type string",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "literal",
          values: { 3: "label for 3", 5: "label for 5" },
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with array of numeric literals having incompatible default value type string",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("3")]: NonEmptyStringSchema.parse("label for 3"),
                [NonEmptyStringSchema.parse("5")]: NonEmptyStringSchema.parse("label for 5"),
              },
            },
          },
        },
      },
      testBehaviourDescription:
        "succeed as an egde-case, with numeric keys being treated as strings",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: {
          type: "literal",
          values: { 3: "label for true", notNumber: "label for notNumber" },
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with array of numeric literals having incompatible record keys",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "number",
        choices: {
          type: "literal",
          values: [3, "notNumber"],
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with array of numeric literals having incompatible array values",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  // Test cases for full object without choices shorthands - verbose string literals
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "string",
        choices: {
          type: "literal",
          values: ["string1", "string2"],
        },
      },
      testCaseDescription: "select workflow step, with explicit literal choices having string type",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "string",
              values: [
                NonEmptyStringSchema.parse("string1"),
                NonEmptyStringSchema.parse("string2"),
              ],
            },
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },

  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "literal",
          values: ["string1", "string2"],
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with array of string literals having compatible default value type string",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "array",
              valueType: "string",
              values: [
                NonEmptyStringSchema.parse("string1"),
                NonEmptyStringSchema.parse("string2"),
              ],
            },
          },
        },
      },
      testBehaviourDescription: "fail",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "literal",
          values: { string1: "label for string1", string2: "label for string2" },
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with record with string literals having compatible default value type string",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("string1")]:
                  NonEmptyStringSchema.parse("label for string1"),
                [NonEmptyStringSchema.parse("string2")]:
                  NonEmptyStringSchema.parse("label for string2"),
              },
            },
          },
        },
      },
      testBehaviourDescription:
        "succeed as an egde-case, with numeric keys being treated as strings",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "string",
        choices: {
          type: "literal",
          values: { string1: "label for string1", 3: "label for 3" },
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with record with string literals having incompatible record keys",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "literalValues",
            values: {
              type: "literal",
              format: "record",
              valueType: "string",
              values: {
                [NonEmptyStringSchema.parse("string1")]:
                  NonEmptyStringSchema.parse("label for string1"),
                [NonEmptyStringSchema.parse("3")]: NonEmptyStringSchema.parse("label for 3"),
              },
            },
          },
        },
      },
      testBehaviourDescription:
        "succeed as an egde-case, with numeric keys being treated as strings",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        valueType: "string",
        choices: {
          type: "literal",
          values: ["string1", 3],
        },
      },
      testCaseDescription:
        "select workflow step, with explicit choices with array with string literals having incompatible array values",
    },
    testOutcome: {
      data: {
        success: false,
      },
      testBehaviourDescription: "fail",
    },
  },
  // References - absolute paths
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "jsonFile",
          file: "/absolute/path/to/term.json",
        },
      },
      testCaseDescription:
        "select workflow step, with choices defined as absolute .json path reference without selector",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: TermResourceReferenceSchema.parse({
              type: "absolute",
              filePath: {
                format: "json",
                path: JsonAbsolutePathSchema.parse("/absolute/path/to/term.json"),
                selector: null,
              },
            }),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "jsonFile",
          file: "/absolute/path/to/term.json",
          selector: [1, "key"],
        },
      },
      testCaseDescription:
        "select workflow step, with choices defined as absolute .json path reference with selector",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: TermResourceReferenceSchema.parse({
              type: "absolute",
              filePath: {
                format: "json",
                path: JsonAbsolutePathSchema.parse("/absolute/path/to/term.json"),
                selector: [NonNegativeIntegerSchema.parse(1), NonEmptyStringSchema.parse("key")],
              },
            }),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "yamlFile",
          file: "/absolute/path/to/term.yml",
        },
      },
      testCaseDescription:
        "select workflow step, with choices defined as absolute .yaml path reference without selector",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: TermResourceReferenceSchema.parse({
              type: "absolute",
              filePath: {
                format: "yaml",
                path: YamlAbsolutePathSchema.parse("/absolute/path/to/term.yml"),
                selector: null,
              },
            }),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "yamlFile",
          file: "/absolute/path/to/term.yml",
          selector: [1, "key"],
        },
      },
      testCaseDescription:
        "select workflow step, with choices defined as absolute .yaml path reference with selector",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: TermResourceReferenceSchema.parse({
              type: "absolute",
              filePath: {
                format: "yaml",
                path: YamlAbsolutePathSchema.parse("/absolute/path/to/term.yml"),
                selector: [NonNegativeIntegerSchema.parse(1), NonEmptyStringSchema.parse("key")],
              },
            }),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "plainFile",
          file: "/absolute/path/to/term.txt",
        },
      },
      testCaseDescription:
        "select workflow step, with choices defined as absolute plaintext reference without overridden options",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: TermResourceReferenceSchema.parse({
              type: "absolute",
              filePath: {
                format: "plaintext",
                path: AbsolutePathSchema.parse("/absolute/path/to/term.txt"),
                // load defaults
                options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
              },
            }),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
  {
    testInput: {
      data: {
        id: "selectStepId",
        targetVariable: "selectStepIdOverride",
        type: "select",
        message: "Pick an option",
        choices: {
          type: "plainFile",
          file: "/absolute/path/to/term.txt",
          options: {
            whitespaceLines: "skipTrailing",
            trimWhitespace: false,
            strict: false,
          },
        },
      },
      testCaseDescription:
        "select workflow step, with choices defined as absolute plaintext reference with overridden options",
    },
    testOutcome: {
      data: {
        success: true,
        parsedResult: {
          id: NonEmptyStringSchema.parse("selectStepId"),
          targetVariable: NonEmptyStringSchema.parse("selectStepIdOverride"),
          type: "select",
          valueType: "string",
          message: NonEmptyStringSchema.parse("Pick an option"),
          choices: {
            type: "reference",
            reference: TermResourceReferenceSchema.parse({
              type: "absolute",
              filePath: {
                format: "plaintext",
                path: AbsolutePathSchema.parse("/absolute/path/to/term.txt"),
                options: {
                  whitespaceLines: "skipTrailing",
                  trimWhitespace: false,
                  strict: false,
                },
              },
            }),
          },
        },
      },
      testBehaviourDescription: "succeed",
    },
  },
] satisfies {
  testInput: {
    data: z.input<typeof SelectWorkflowStepSchema>;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data:
      | {
          success: true;
          parsedResult: z.output<typeof SelectWorkflowStepSchema>;
        }
      | {
          success: false;
        };
  };
}[];

describe("SelectWorkflowStepSchema", () => {
  for (const { testInput, testOutcome } of testCasesForSelectWorkflowStepSchema) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const parsingResult = SelectWorkflowStepSchema.safeParse(testInput.data);
      assert.strictEqual(parsingResult.success, testOutcome.data.success);
      if (testOutcome.data.success) {
        assert.deepEqual(parsingResult.data, testOutcome.data.parsedResult);
      }
    });
  }
});
