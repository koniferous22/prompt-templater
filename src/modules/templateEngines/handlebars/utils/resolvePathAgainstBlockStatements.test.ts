import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";

import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import { NonEmptyStringSchema } from "../../../../validation/string/customTypes/string.js";
import { handlebarsResolvePathAgainstBlockStatements } from "./resolvePathAgainstBlockStatements.js";
import type { HandlebarsSelector, LocatedPathExpression, SimplifiedAstNode } from "./types.js";

const testCasesForResolvePathAgainstHbsBlockStatements = [
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: null,
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [],
      },
      testCaseDescription: "null pathExpr",
    },
    testOutcome: {
      testBehaviourDescription: "return null",
      data: {
        result: true,
        selector: null,
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: true,
            depth: 0,
            parts: ["key"],
            original: "@key",
            loc: { source: "source", start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [
          {
            helper: "each",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("items"),
                shouldExpectIterable: true,
              },
            ],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "data pathExpr (@key)",
    },
    testOutcome: {
      testBehaviourDescription: "return null",
      data: {
        result: true,
        selector: null,
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: false,
            depth: 0,
            parts: ["name"],
            original: "name",
            loc: { source: "source", start: { line: 1, column: 8 }, end: { line: 1, column: 12 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [],
      },
      testCaseDescription: "simple path with empty blockStatementStack",
    },
    testOutcome: {
      testBehaviourDescription: "return the parts as selector",
      data: {
        result: true,
        selector: [
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("name"),
            shouldExpectIterable: false,
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: false,
            depth: 0,
            parts: ["this"],
            original: "this",
            loc: { source: "source", start: { line: 2, column: 3 }, end: { line: 2, column: 7 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [],
      },
      testCaseDescription: "pathExpr with only 'this' part and empty chain",
    },
    testOutcome: {
      testBehaviourDescription: "return empty array after filtering 'this'",
      data: {
        result: true,
        selector: [],
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: false,
            depth: 0,
            parts: ["firstName"],
            original: "firstName",
            loc: { source: "source", start: { line: 3, column: 5 }, end: { line: 3, column: 14 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [
          {
            helper: "with",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("person"),
                shouldExpectIterable: false,
              },
            ],
            isEach: false,
          },
        ],
      },
      testCaseDescription: "path inside a with block (no depth)",
    },
    testOutcome: {
      testBehaviourDescription: "prepend the resolvedSelector of the enclosing block",
      data: {
        result: true,
        selector: [
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("person"),
            shouldExpectIterable: false,
          },
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("firstName"),
            shouldExpectIterable: false,
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: false,
            depth: 1,
            parts: ["name"],
            original: "../name",
            loc: { source: "source", start: { line: 5, column: 10 }, end: { line: 5, column: 17 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [
          {
            helper: "each",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("items"),
                shouldExpectIterable: true,
              },
            ],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "path with depth=1 that pops the only block",
    },
    testOutcome: {
      testBehaviourDescription: "return only the parts (base becomes empty)",
      data: {
        result: true,
        selector: [
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("name"),
            shouldExpectIterable: false,
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: false,
            depth: 1,
            parts: ["name"],
            original: "../name",
            loc: { source: "source", start: { line: 6, column: 12 }, end: { line: 6, column: 19 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [
          {
            helper: "with",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("person"),
                shouldExpectIterable: false,
              },
            ],
            isEach: false,
          },
          {
            helper: "each",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("person"),
                shouldExpectIterable: false,
              },
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("items"),
                shouldExpectIterable: true,
              },
            ],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "path with depth=1 inside nested each",
    },
    testOutcome: {
      testBehaviourDescription: "pop one level and use the outer block's resolvedSelector",
      data: {
        result: true,
        selector: [
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("person"),
            shouldExpectIterable: false,
          },
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("name"),
            shouldExpectIterable: false,
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: false,
            depth: 2,
            parts: ["rootProp"],
            original: "../../rootProp",
            loc: { source: "source", start: { line: 8, column: 4 }, end: { line: 8, column: 18 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [
          {
            helper: "with",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("a"),
                shouldExpectIterable: false,
              },
            ],
            isEach: false,
          },
          {
            helper: "each",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("a"),
                shouldExpectIterable: false,
              },
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("b"),
                shouldExpectIterable: true,
              },
            ],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "path with depth greater than or equal to chain length",
    },
    testOutcome: {
      testBehaviourDescription: "return only the parts (base is empty)",
      data: {
        result: true,
        selector: [
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("rootProp"),
            shouldExpectIterable: false,
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: false,
            depth: 0,
            parts: ["this", "title", "."],
            original: "this.title",
            loc: { source: "source", start: { line: 4, column: 7 }, end: { line: 4, column: 17 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [
          {
            helper: "each",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("items"),
                shouldExpectIterable: true,
              },
            ],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "path containing 'this' and '.' that must be filtered",
    },
    testOutcome: {
      testBehaviourDescription: "filter out 'this' and '.' then prepend current resolvedSelector",
      data: {
        result: true,
        selector: [
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("items"),
            shouldExpectIterable: true,
          },
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("title"),
            shouldExpectIterable: false,
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: {
        astNode: {
          kind: "mustache",
          path: {
            type: "PathExpression",
            data: false,
            depth: 0,
            parts: [],
            original: "this",
            loc: { source: "source", start: { line: 9, column: 2 }, end: { line: 9, column: 6 } },
          },
          params: [],
          original: {} as any,
        } as SimplifiedAstNode,
        blockStatementStack: [
          {
            helper: "with",
            resolvedSelector: [
              {
                type: "stringSegment" as const,
                value: NonEmptyStringSchema.parse("person"),
                shouldExpectIterable: false,
              },
            ],
            isEach: false,
          },
        ],
      },
      testCaseDescription: "empty parts (pure this) inside a with",
    },
    testOutcome: {
      testBehaviourDescription: "return the current block's resolvedSelector",
      data: {
        result: true,
        selector: [
          {
            type: "stringSegment" as const,
            value: NonEmptyStringSchema.parse("person"),
            shouldExpectIterable: false,
          },
        ],
      },
    },
  },
] satisfies {
  testInput: {
    data: {
      astNode: SimplifiedAstNode;
      blockStatementStack: LocatedPathExpression["blockStatementStack"];
    };
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: true;
      selector: HandlebarsSelector | null;
    };
  };
}[];

describe("resolvePathAgainstHbsBlockStatements", () => {
  for (const { testInput, testOutcome } of testCasesForResolvePathAgainstHbsBlockStatements) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const result = handlebarsResolvePathAgainstBlockStatements(
        testInput.data.astNode,
        testInput.data.blockStatementStack,
        {
          templateFile: AbsolutePathSchema.parse("/example/absolute/path/to/template"),
          sourceWorkflowFile: AbsolutePathSchema.parse("/example/absolute/path/to/workflow"),
        },
      );
      if (testOutcome.data.result === true) {
        assert.ok(result.isOk());
        expect(result.value).toStrictEqual(testOutcome.data.selector);
      }
    });
  }
});
