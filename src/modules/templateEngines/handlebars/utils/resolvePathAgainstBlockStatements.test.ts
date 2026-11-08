import { describe, expect, it } from "bun:test";

import { SelectorSchema } from "../../../../validation/resourceReference/term/schemas/selector.js";
import { resolvePathAgainstHbsBlockStatements } from "./resolvePathAgainstBlockStatements.js";
import type { LocatedPathExpression } from "./types.js";

const testCasesForResolvePathAgainstHbsBlockStatements = [
  {
    testInput: {
      data: {
        pathExpr: null,
        blockStatementStack: [],
      },
      testCaseDescription: "null pathExpr",
    },
    testOutcome: {
      testBehaviourDescription: "return null",
      data: {
        result: null,
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: true,
          depth: 0,
          parts: ["key"],
          original: "@key",
          loc: { source: "source", start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        },
        blockStatementStack: [
          {
            helper: "each",
            resolvedSelector: ["items"],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "data pathExpr (@key)",
    },
    testOutcome: {
      testBehaviourDescription: "return null",
      data: {
        result: null,
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: false,
          depth: 0,
          parts: ["name"],
          original: "name",
          loc: { source: "source", start: { line: 1, column: 8 }, end: { line: 1, column: 12 } },
        },
        blockStatementStack: [],
      },
      testCaseDescription: "simple path with empty blockStatementStack",
    },
    testOutcome: {
      testBehaviourDescription: "return the parts as selector",
      data: {
        result: SelectorSchema.parse(["name"]),
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: false,
          depth: 0,
          parts: ["this"],
          original: "this",
          loc: { source: "source", start: { line: 2, column: 3 }, end: { line: 2, column: 7 } },
        },
        blockStatementStack: [],
      },
      testCaseDescription: "pathExpr with only 'this' part and empty chain",
    },
    testOutcome: {
      testBehaviourDescription: "return empty array after filtering 'this'",
      data: {
        result: [],
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: false,
          depth: 0,
          parts: ["firstName"],
          original: "firstName",
          loc: { source: "source", start: { line: 3, column: 5 }, end: { line: 3, column: 14 } },
        },
        blockStatementStack: [
          {
            helper: "with",
            resolvedSelector: ["person"],
            isEach: false,
          },
        ],
      },
      testCaseDescription: "path inside a with block (no depth)",
    },
    testOutcome: {
      testBehaviourDescription: "prepend the resolvedSelector of the enclosing block",
      data: {
        result: SelectorSchema.parse(["person", "firstName"]),
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: false,
          depth: 1,
          parts: ["name"],
          original: "../name",
          loc: { source: "source", start: { line: 5, column: 10 }, end: { line: 5, column: 17 } },
        },
        blockStatementStack: [
          {
            helper: "each",
            resolvedSelector: ["items"],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "path with depth=1 that pops the only block",
    },
    testOutcome: {
      testBehaviourDescription: "return only the parts (base becomes empty)",
      data: {
        result: SelectorSchema.parse(["name"]),
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: false,
          depth: 1,
          parts: ["name"],
          original: "../name",
          loc: { source: "source", start: { line: 6, column: 12 }, end: { line: 6, column: 19 } },
        },
        blockStatementStack: [
          {
            helper: "with",
            resolvedSelector: ["person"],
            isEach: false,
          },
          {
            helper: "each",
            resolvedSelector: ["person", "items"],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "path with depth=1 inside nested each",
    },
    testOutcome: {
      testBehaviourDescription: "pop one level and use the outer block's resolvedSelector",
      data: {
        result: SelectorSchema.parse(["person", "name"]),
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: false,
          depth: 2,
          parts: ["rootProp"],
          original: "../../rootProp",
          loc: { source: "source", start: { line: 8, column: 4 }, end: { line: 8, column: 18 } },
        },
        blockStatementStack: [
          {
            helper: "with",
            resolvedSelector: ["a"],
            isEach: false,
          },
          {
            helper: "each",
            resolvedSelector: ["a", "b"],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "path with depth greater than or equal to chain length",
    },
    testOutcome: {
      testBehaviourDescription: "return only the parts (base is empty)",
      data: {
        result: SelectorSchema.parse(["rootProp"]),
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: false,
          depth: 0,
          parts: ["this", "title", "."],
          original: "this.title",
          loc: { source: "source", start: { line: 4, column: 7 }, end: { line: 4, column: 17 } },
        },
        blockStatementStack: [
          {
            helper: "each",
            resolvedSelector: ["items"],
            isEach: true,
          },
        ],
      },
      testCaseDescription: "path containing 'this' and '.' that must be filtered",
    },
    testOutcome: {
      testBehaviourDescription: "filter out 'this' and '.' then prepend current resolvedSelector",
      data: {
        result: SelectorSchema.parse(["items", "title"]),
      },
    },
  },
  {
    testInput: {
      data: {
        pathExpr: {
          type: "PathExpression",
          data: false,
          depth: 0,
          parts: [],
          original: "this",
          loc: { source: "source", start: { line: 9, column: 2 }, end: { line: 9, column: 6 } },
        },
        blockStatementStack: [
          {
            helper: "with",
            resolvedSelector: ["person"],
            isEach: false,
          },
        ],
      },
      testCaseDescription: "empty parts (pure this) inside a with",
    },
    testOutcome: {
      testBehaviourDescription: "return the current block's resolvedSelector",
      data: {
        result: SelectorSchema.parse(["person"]),
      },
    },
  },
] satisfies {
  testInput: {
    data: {
      pathExpr: hbs.AST.PathExpression | null;
      blockStatementStack: LocatedPathExpression["blockStatementStack"];
    };
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: ReturnType<typeof resolvePathAgainstHbsBlockStatements>;
    };
  };
}[];

describe("resolvePathAgainstHbsBlockStatements", () => {
  for (const { testInput, testOutcome } of testCasesForResolvePathAgainstHbsBlockStatements) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const result = resolvePathAgainstHbsBlockStatements(
        testInput.data.pathExpr,
        testInput.data.blockStatementStack,
      );
      expect(result).toStrictEqual(testOutcome.data.result);
    });
  }
});
