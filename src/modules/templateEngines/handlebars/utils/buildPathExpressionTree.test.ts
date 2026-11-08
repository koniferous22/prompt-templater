import { describe, expect, it } from "bun:test";
import assert from "node:assert/strict";

import Handlebars from "handlebars";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import { buildHandlebarsPathExpressionTree } from "./buildPathExpressionTree.js";
import type { PathExpressionTreeNode } from "./types.js";

// assertion helpers
function simplifyPath(p: hbs.AST.PathExpression | null) {
  if (!p) return null;
  return {
    type: p.type,
    data: p.data,
    depth: p.depth,
    parts: p.parts,
    original: p.original,
  };
}

function simplifyNode(node: PathExpressionTreeNode): unknown {
  if (node.kind === "mustache") {
    return {
      kind: "mustache",
      path: simplifyPath(node.path),
      params: node.params.map((e) =>
        e.type === "PathExpression" ? simplifyPath(e as hbs.AST.PathExpression) : e,
      ),
      // we only assert that original exists and has the right type
      originalType: node.original?.type,
    };
  }
  return {
    kind: "block",
    helper: node.helper,
    path: simplifyPath(node.path),
    params: node.params.map((e) =>
      e.type === "PathExpression" ? simplifyPath(e as hbs.AST.PathExpression) : e,
    ),
    program: node.program.map(simplifyNode),
    inverse: node.inverse.map(simplifyNode),
    originalType: node.original?.type,
  };
}

const testCasesForBuildHandlebarsPathExpressionTree = [
  {
    testInput: {
      template: `Hello {{name}}!`,
      testCaseDescription: "simple content + single mustache",
    },
    testOutcome: {
      testBehaviourDescription: "return a hierarchy containing only the mustache node",
      data: {
        result: true as const,
        nodes: [
          {
            kind: "mustache",
            path: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["name"],
              original: "name",
            },
            params: [],
            originalType: "MustacheStatement",
          },
        ],
      },
    },
  },
  {
    testInput: {
      template: `{{#with person}}{{firstName}}{{/with}}`,
      testCaseDescription: "allowed #with block with nested mustache",
    },
    testOutcome: {
      testBehaviourDescription: "return hierarchy with block node containing the nested mustache",
      data: {
        result: true as const,
        nodes: [
          {
            kind: "block",
            helper: "with",
            path: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["person"],
              original: "person",
            },
            params: [
              {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["person"],
                original: "person",
              },
            ],
            program: [
              {
                kind: "mustache",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["firstName"],
                  original: "firstName",
                },
                params: [],
                originalType: "MustacheStatement",
              },
            ],
            inverse: [],
            originalType: "BlockStatement",
          },
        ],
      },
    },
  },
  {
    testInput: {
      template: `{{#each items}}{{title}}{{else}}{{name}}{{/each}}`,
      testCaseDescription: "allowed #each block with program and inverse",
    },
    testOutcome: {
      testBehaviourDescription:
        "return hierarchy with block containing both program and inverse mustaches",
      data: {
        result: true as const,
        nodes: [
          {
            kind: "block",
            helper: "each",
            path: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["items"],
              original: "items",
            },
            params: [
              {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["items"],
                original: "items",
              },
            ],
            program: [
              {
                kind: "mustache",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["title"],
                  original: "title",
                },
                params: [],
                originalType: "MustacheStatement",
              },
            ],
            inverse: [
              {
                kind: "mustache",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["name"],
                  original: "name",
                },
                params: [],
                originalType: "MustacheStatement",
              },
            ],
            originalType: "BlockStatement",
          },
        ],
      },
    },
  },
  {
    testInput: {
      template: `{{> partial}}`,
      testCaseDescription: "forbidden PartialStatement",
    },
    testOutcome: {
      testBehaviourDescription: "reject with unsupported statement type error",
      data: {
        result: false as const,
        errorCode:
          "module_templateEngines_handlebars_buildHandlebarsPathExpressionTree_unsupportedAstStatement",
      },
    },
  },
  {
    testInput: {
      template: `{{#customHelper}}{{/customHelper}}`,
      testCaseDescription: "non-whitelisted block helper",
    },
    testOutcome: {
      testBehaviourDescription: "reject with not-in-whitelist error",
      data: {
        result: false as const,
        errorCode:
          "module_templateEngines_handlebars_buildHandlebarsPathExpressionTree_unsupportedAstBlockHelper",
      },
    },
  },
  {
    testInput: {
      template: `plain text only {{! a comment }}`,
      testCaseDescription: "only content and comment statements",
    },
    testOutcome: {
      testBehaviourDescription: "return empty hierarchy (content/comments are ignored)",
      data: {
        result: true as const,
        nodes: [],
      },
    },
  },
  {
    testInput: {
      template: `{{#if condition}}{{yes}}{{else}}{{no}}{{/if}}`,
      testCaseDescription: "allowed #if block with inverse",
    },
    testOutcome: {
      testBehaviourDescription:
        "return hierarchy with if-block containing both program and inverse",
      data: {
        result: true as const,
        nodes: [
          {
            kind: "block",
            helper: "if",
            path: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["condition"],
              original: "condition",
            },
            params: [
              {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["condition"],
                original: "condition",
              },
            ],
            program: [
              {
                kind: "mustache",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["yes"],
                  original: "yes",
                },
                params: [],
                originalType: "MustacheStatement",
              },
            ],
            inverse: [
              {
                kind: "mustache",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["no"],
                  original: "no",
                },
                params: [],
                originalType: "MustacheStatement",
              },
            ],
            originalType: "BlockStatement",
          },
        ],
      },
    },
  },
] satisfies {
  testInput: {
    template: string;
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data:
      | {
          result: true;
          nodes: unknown[];
        }
      | {
          result: false;
          errorCode: AppErrorCode;
        };
  };
}[];

describe("buildHandlebarsPathExpressionTree", () => {
  for (const { testInput, testOutcome } of testCasesForBuildHandlebarsPathExpressionTree) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, () => {
      const ast = Handlebars.parse(testInput.template) as unknown as hbs.AST.Program;
      const pathExpressionTree = buildHandlebarsPathExpressionTree(ast);

      if (testOutcome.data.result === true) {
        assert.ok(pathExpressionTree.isOk(), "expected Ok result");
        const simplified = pathExpressionTree.value.map(simplifyNode);
        expect(simplified).toEqual(testOutcome.data.nodes);
      } else {
        assert.ok(pathExpressionTree.isErr(), "expected Err result");
        assert.equal(pathExpressionTree.error.code, testOutcome.data.errorCode);
      }
    });
  }
});
