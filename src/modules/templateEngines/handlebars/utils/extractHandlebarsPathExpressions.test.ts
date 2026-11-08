import { describe, expect, it } from "bun:test";

import { extractHandlebarsPathExpressions } from "./extractHandlebarsPathExpressions.js";
import type { PathExpressionTreeNode } from "./types.js";

const testCasesForExtractHandlebarsPathExpressions = [
  {
    testInput: {
      data: [
        {
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
          original: {
            type: "MustacheStatement",
            path: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["name"],
              original: "name",
              loc: {
                source: "source",
                start: { line: 1, column: 8 },
                end: { line: 1, column: 12 },
              },
            },
            params: [],
            hash: {
              type: "Hash",
              pairs: [],
              loc: {
                source: "source",
                start: { line: 1, column: 12 },
                end: { line: 1, column: 14 },
              },
            },
            escaped: true,
            strip: { open: false, close: false },
            loc: { source: "source", start: { line: 1, column: 6 }, end: { line: 1, column: 14 } },
          },
        },
      ] as PathExpressionTreeNode[],
      testCaseDescription: "a single top-level mustache referencing a simple path",
    },
    testOutcome: {
      testBehaviourDescription:
        "return one LocatedPathExpression for the mustache path with empty blockStatementStack",
      data: {
        result: [
          {
            pathExpr: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["name"],
              original: "name",
              loc: {
                source: "source",
                start: { line: 1, column: 8 },
                end: { line: 1, column: 12 },
              },
            },
            blockStatementStack: [],
            mustache: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["name"],
                original: "name",
                loc: {
                  source: "source",
                  start: { line: 1, column: 8 },
                  end: { line: 1, column: 12 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["name"],
                  original: "name",
                  loc: {
                    source: "source",
                    start: { line: 1, column: 8 },
                    end: { line: 1, column: 12 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 1, column: 12 },
                    end: { line: 1, column: 14 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 1, column: 6 },
                  end: { line: 1, column: 14 },
                },
              },
            },
            origin: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["name"],
                original: "name",
                loc: {
                  source: "source",
                  start: { line: 1, column: 8 },
                  end: { line: 1, column: 12 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["name"],
                  original: "name",
                  loc: {
                    source: "source",
                    start: { line: 1, column: 8 },
                    end: { line: 1, column: 12 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 1, column: 12 },
                    end: { line: 1, column: 14 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 1, column: 6 },
                  end: { line: 1, column: 14 },
                },
              },
            },
          },
        ] as ReturnType<typeof extractHandlebarsPathExpressions>,
      },
    },
  },
  {
    testInput: {
      data: [
        {
          kind: "block",
          helper: "with",
          path: {
            type: "PathExpression",
            data: false,
            depth: 0,
            parts: ["person"],
            original: "person",
            loc: { source: "source", start: { line: 2, column: 9 }, end: { line: 2, column: 15 } },
          },
          params: [
            {
              type: "PathExpression",
              loc: {
                source: "source",
                start: { line: 2, column: 9 },
                end: { line: 2, column: 15 },
              },
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
                loc: {
                  source: "source",
                  start: { line: 3, column: 4 },
                  end: { line: 3, column: 13 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["firstName"],
                  original: "firstName",
                  loc: {
                    source: "source",
                    start: { line: 3, column: 4 },
                    end: { line: 3, column: 13 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 3, column: 13 },
                    end: { line: 3, column: 15 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 3, column: 2 },
                  end: { line: 3, column: 15 },
                },
              },
            },
          ],
          inverse: [],
          original: {
            type: "BlockStatement",
            openStrip: { open: false, close: false },
            closeStrip: { open: false, close: false },
            inverseStrip: { open: false, close: false },
            path: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["with"],
              original: "with",
              loc: { source: "source", start: { line: 2, column: 3 }, end: { line: 2, column: 7 } },
            },
            params: [
              {
                type: "PathExpression",
                loc: {
                  source: "source",
                  start: { line: 2, column: 9 },
                  end: { line: 2, column: 15 },
                },
              },
            ],
            hash: {
              type: "Hash",
              pairs: [],
              loc: {
                source: "source",
                start: { line: 2, column: 9 },
                end: { line: 2, column: 15 },
              },
            },
            program: null as any,
            inverse: null as any,
            loc: { source: "source", start: { line: 2, column: 0 }, end: { line: 5, column: 9 } },
          },
        },
      ] as PathExpressionTreeNode[],
      testCaseDescription: "a #with block containing a nested mustache",
    },
    testOutcome: {
      testBehaviourDescription:
        "return LocatedPathExpressions for the block subject and the nested mustache, with the mustache carrying the with block in its blockStatementStack",
      data: {
        result: [
          {
            pathExpr: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["person"],
              original: "person",
              loc: {
                source: "source",
                start: { line: 2, column: 9 },
                end: { line: 2, column: 15 },
              },
            },
            blockStatementStack: [],
            origin: {
              kind: "block",
              helper: "with",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["person"],
                original: "person",
                loc: {
                  source: "source",
                  start: { line: 2, column: 9 },
                  end: { line: 2, column: 15 },
                },
              },
              params: [
                {
                  type: "PathExpression",
                  loc: {
                    source: "source",
                    start: { line: 2, column: 9 },
                    end: { line: 2, column: 15 },
                  },
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
                    loc: {
                      source: "source",
                      start: { line: 3, column: 4 },
                      end: { line: 3, column: 13 },
                    },
                  },
                  params: [],
                  original: {
                    type: "MustacheStatement",
                    path: {
                      type: "PathExpression",
                      data: false,
                      depth: 0,
                      parts: ["firstName"],
                      original: "firstName",
                      loc: {
                        source: "source",
                        start: { line: 3, column: 4 },
                        end: { line: 3, column: 13 },
                      },
                    },
                    params: [],
                    hash: {
                      type: "Hash",
                      pairs: [],
                      loc: {
                        source: "source",
                        start: { line: 3, column: 13 },
                        end: { line: 3, column: 15 },
                      },
                    },
                    escaped: true,
                    strip: { open: false, close: false },
                    loc: {
                      source: "source",
                      start: { line: 3, column: 2 },
                      end: { line: 3, column: 15 },
                    },
                  },
                },
              ],
              inverse: [],
              original: {
                type: "BlockStatement",
                openStrip: { open: false, close: false },
                closeStrip: { open: false, close: false },
                inverseStrip: { open: false, close: false },
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["with"],
                  original: "with",
                  loc: {
                    source: "source",
                    start: { line: 2, column: 3 },
                    end: { line: 2, column: 7 },
                  },
                },
                params: [
                  {
                    type: "PathExpression",
                    loc: {
                      source: "source",
                      start: { line: 2, column: 9 },
                      end: { line: 2, column: 15 },
                    },
                  },
                ],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 2, column: 9 },
                    end: { line: 2, column: 15 },
                  },
                },
                program: null,
                inverse: null,
                loc: {
                  source: "source",
                  start: { line: 2, column: 0 },
                  end: { line: 5, column: 9 },
                },
              },
            },
          },
          {
            pathExpr: {
              type: "PathExpression",
              loc: {
                source: "source",
                start: { line: 2, column: 9 },
                end: { line: 2, column: 15 },
              },
            },
            blockStatementStack: [],
            origin: {
              kind: "block",
              helper: "with",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["person"],
                original: "person",
                loc: {
                  source: "source",
                  start: { line: 2, column: 9 },
                  end: { line: 2, column: 15 },
                },
              },
              params: [
                {
                  type: "PathExpression",
                  loc: {
                    source: "source",
                    start: { line: 2, column: 9 },
                    end: { line: 2, column: 15 },
                  },
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
                    loc: {
                      source: "source",
                      start: { line: 3, column: 4 },
                      end: { line: 3, column: 13 },
                    },
                  },
                  params: [],
                  original: {
                    type: "MustacheStatement",
                    path: {
                      type: "PathExpression",
                      data: false,
                      depth: 0,
                      parts: ["firstName"],
                      original: "firstName",
                      loc: {
                        source: "source",
                        start: { line: 3, column: 4 },
                        end: { line: 3, column: 13 },
                      },
                    },
                    params: [],
                    hash: {
                      type: "Hash",
                      pairs: [],
                      loc: {
                        source: "source",
                        start: { line: 3, column: 13 },
                        end: { line: 3, column: 15 },
                      },
                    },
                    escaped: true,
                    strip: { open: false, close: false },
                    loc: {
                      source: "source",
                      start: { line: 3, column: 2 },
                      end: { line: 3, column: 15 },
                    },
                  },
                },
              ],
              inverse: [],
              original: {
                type: "BlockStatement",
                openStrip: { open: false, close: false },
                closeStrip: { open: false, close: false },
                inverseStrip: { open: false, close: false },
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["with"],
                  original: "with",
                  loc: {
                    source: "source",
                    start: { line: 2, column: 3 },
                    end: { line: 2, column: 7 },
                  },
                },
                params: [
                  {
                    type: "PathExpression",
                    loc: {
                      source: "source",
                      start: { line: 2, column: 9 },
                      end: { line: 2, column: 15 },
                    },
                  },
                ],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 2, column: 9 },
                    end: { line: 2, column: 15 },
                  },
                },
                program: null,
                inverse: null,
                loc: {
                  source: "source",
                  start: { line: 2, column: 0 },
                  end: { line: 5, column: 9 },
                },
              },
            },
          },
          {
            pathExpr: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["firstName"],
              original: "firstName",
              loc: {
                source: "source",
                start: { line: 3, column: 4 },
                end: { line: 3, column: 13 },
              },
            },
            blockStatementStack: [
              {
                helper: "with",
                resolvedSelector: ["person"],
                isEach: false,
              },
            ],
            mustache: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["firstName"],
                original: "firstName",
                loc: {
                  source: "source",
                  start: { line: 3, column: 4 },
                  end: { line: 3, column: 13 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["firstName"],
                  original: "firstName",
                  loc: {
                    source: "source",
                    start: { line: 3, column: 4 },
                    end: { line: 3, column: 13 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 3, column: 13 },
                    end: { line: 3, column: 15 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 3, column: 2 },
                  end: { line: 3, column: 15 },
                },
              },
            },
            origin: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["firstName"],
                original: "firstName",
                loc: {
                  source: "source",
                  start: { line: 3, column: 4 },
                  end: { line: 3, column: 13 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["firstName"],
                  original: "firstName",
                  loc: {
                    source: "source",
                    start: { line: 3, column: 4 },
                    end: { line: 3, column: 13 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 3, column: 13 },
                    end: { line: 3, column: 15 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 3, column: 2 },
                  end: { line: 3, column: 15 },
                },
              },
            },
          },
        ] as ReturnType<typeof extractHandlebarsPathExpressions>,
      },
    },
  },
  {
    testInput: {
      data: [
        {
          kind: "block",
          helper: "each",
          path: {
            type: "PathExpression",
            data: false,
            depth: 0,
            parts: ["items"],
            original: "items",
            loc: { source: "source", start: { line: 6, column: 9 }, end: { line: 6, column: 14 } },
          },
          params: [
            {
              type: "PathExpression",
              loc: {
                source: "source",
                start: { line: 6, column: 9 },
                end: { line: 6, column: 14 },
              },
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
                original: "this.title",
                loc: {
                  source: "source",
                  start: { line: 7, column: 6 },
                  end: { line: 7, column: 16 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["title"],
                  original: "this.title",
                  loc: {
                    source: "source",
                    start: { line: 7, column: 6 },
                    end: { line: 7, column: 16 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 7, column: 16 },
                    end: { line: 7, column: 18 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 7, column: 4 },
                  end: { line: 7, column: 18 },
                },
              },
            },
            {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 1,
                parts: ["name"],
                original: "../name",
                loc: {
                  source: "source",
                  start: { line: 7, column: 21 },
                  end: { line: 7, column: 28 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 1,
                  parts: ["name"],
                  original: "../name",
                  loc: {
                    source: "source",
                    start: { line: 7, column: 21 },
                    end: { line: 7, column: 28 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 7, column: 28 },
                    end: { line: 7, column: 30 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 7, column: 19 },
                  end: { line: 7, column: 30 },
                },
              },
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
                loc: {
                  source: "source",
                  start: { line: 10, column: 16 },
                  end: { line: 10, column: 20 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["name"],
                  original: "name",
                  loc: {
                    source: "source",
                    start: { line: 10, column: 16 },
                    end: { line: 10, column: 20 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 10, column: 20 },
                    end: { line: 10, column: 22 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 10, column: 14 },
                  end: { line: 10, column: 22 },
                },
              },
            },
          ],
          original: {
            type: "BlockStatement",
            openStrip: {
              open: false,
              close: false,
            },
            closeStrip: {
              open: false,
              close: false,
            },
            inverseStrip: {
              open: false,
              close: false,
            },
            path: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["each"],
              original: "each",
              loc: { source: "source", start: { line: 6, column: 3 }, end: { line: 6, column: 7 } },
            },
            params: [
              {
                type: "PathExpression",
                loc: {
                  source: "source",
                  start: { line: 6, column: 9 },
                  end: { line: 6, column: 14 },
                },
              },
            ],
            hash: {
              type: "Hash",
              pairs: [],
              loc: {
                source: "source",
                start: { line: 6, column: 9 },
                end: { line: 6, column: 14 },
              },
            },
            program: null as any,
            inverse: null as any,
            loc: { source: "source", start: { line: 6, column: 0 }, end: { line: 11, column: 9 } },
          },
        },
      ] as PathExpressionTreeNode[],
      testCaseDescription:
        "a #each block with program mustaches (including ../) and an inverse mustache",
    },
    testOutcome: {
      testBehaviourDescription:
        "return LocatedPathExpressions for the each subject, program paths (with each in blockStatementStack) and inverse path (without the each blockStatementStack)",
      data: {
        result: [
          {
            pathExpr: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["items"],
              original: "items",
              loc: {
                source: "source",
                start: { line: 6, column: 9 },
                end: { line: 6, column: 14 },
              },
            },
            blockStatementStack: [],
            origin: {
              kind: "block",
              helper: "each",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["items"],
                original: "items",
                loc: {
                  source: "source",
                  start: { line: 6, column: 9 },
                  end: { line: 6, column: 14 },
                },
              },
              params: [
                {
                  type: "PathExpression",
                  loc: {
                    source: "source",
                    start: { line: 6, column: 9 },
                    end: { line: 6, column: 14 },
                  },
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
                    original: "this.title",
                    loc: {
                      source: "source",
                      start: { line: 7, column: 6 },
                      end: { line: 7, column: 16 },
                    },
                  },
                  params: [],
                  original: {
                    type: "MustacheStatement",
                    path: {
                      type: "PathExpression",
                      data: false,
                      depth: 0,
                      parts: ["title"],
                      original: "this.title",
                      loc: {
                        source: "source",
                        start: { line: 7, column: 6 },
                        end: { line: 7, column: 16 },
                      },
                    },
                    params: [],
                    hash: {
                      type: "Hash",
                      pairs: [],
                      loc: {
                        source: "source",
                        start: { line: 7, column: 16 },
                        end: { line: 7, column: 18 },
                      },
                    },
                    escaped: true,
                    strip: { open: false, close: false },
                    loc: {
                      source: "source",
                      start: { line: 7, column: 4 },
                      end: { line: 7, column: 18 },
                    },
                  },
                },
                {
                  kind: "mustache",
                  path: {
                    type: "PathExpression",
                    data: false,
                    depth: 1,
                    parts: ["name"],
                    original: "../name",
                    loc: {
                      source: "source",
                      start: { line: 7, column: 21 },
                      end: { line: 7, column: 28 },
                    },
                  },
                  params: [],
                  original: {
                    type: "MustacheStatement",
                    path: {
                      type: "PathExpression",
                      data: false,
                      depth: 1,
                      parts: ["name"],
                      original: "../name",
                      loc: {
                        source: "source",
                        start: { line: 7, column: 21 },
                        end: { line: 7, column: 28 },
                      },
                    },
                    params: [],
                    hash: {
                      type: "Hash",
                      pairs: [],
                      loc: {
                        source: "source",
                        start: { line: 7, column: 28 },
                        end: { line: 7, column: 30 },
                      },
                    },
                    escaped: true,
                    strip: { open: false, close: false },
                    loc: {
                      source: "source",
                      start: { line: 7, column: 19 },
                      end: { line: 7, column: 30 },
                    },
                  },
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
                    loc: {
                      source: "source",
                      start: { line: 10, column: 16 },
                      end: { line: 10, column: 20 },
                    },
                  },
                  params: [],
                  original: {
                    type: "MustacheStatement",
                    path: {
                      type: "PathExpression",
                      data: false,
                      depth: 0,
                      parts: ["name"],
                      original: "name",
                      loc: {
                        source: "source",
                        start: { line: 10, column: 16 },
                        end: { line: 10, column: 20 },
                      },
                    },
                    params: [],
                    hash: {
                      type: "Hash",
                      pairs: [],
                      loc: {
                        source: "source",
                        start: { line: 10, column: 20 },
                        end: { line: 10, column: 22 },
                      },
                    },
                    escaped: true,
                    strip: { open: false, close: false },
                    loc: {
                      source: "source",
                      start: { line: 10, column: 14 },
                      end: { line: 10, column: 22 },
                    },
                  },
                },
              ],
              original: {
                type: "BlockStatement",
                openStrip: {
                  open: false,
                  close: false,
                },
                closeStrip: {
                  open: false,
                  close: false,
                },
                inverseStrip: {
                  open: false,
                  close: false,
                },
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["each"],
                  original: "each",
                  loc: {
                    source: "source",
                    start: { line: 6, column: 3 },
                    end: { line: 6, column: 7 },
                  },
                },
                params: [
                  {
                    type: "PathExpression",
                    loc: {
                      source: "source",
                      start: { line: 6, column: 9 },
                      end: { line: 6, column: 14 },
                    },
                  },
                ],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 6, column: 9 },
                    end: { line: 6, column: 14 },
                  },
                },
                program: null,
                inverse: null,
                loc: {
                  source: "source",
                  start: { line: 6, column: 0 },
                  end: { line: 11, column: 9 },
                },
              },
            },
          },
          {
            pathExpr: {
              type: "PathExpression",
              loc: {
                source: "source",
                start: { line: 6, column: 9 },
                end: { line: 6, column: 14 },
              },
            },
            blockStatementStack: [],
            origin: {
              kind: "block",
              helper: "each",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["items"],
                original: "items",
                loc: {
                  source: "source",
                  start: { line: 6, column: 9 },
                  end: { line: 6, column: 14 },
                },
              },
              params: [
                {
                  type: "PathExpression",
                  loc: {
                    source: "source",
                    start: { line: 6, column: 9 },
                    end: { line: 6, column: 14 },
                  },
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
                    original: "this.title",
                    loc: {
                      source: "source",
                      start: { line: 7, column: 6 },
                      end: { line: 7, column: 16 },
                    },
                  },
                  params: [],
                  original: {
                    type: "MustacheStatement",
                    path: {
                      type: "PathExpression",
                      data: false,
                      depth: 0,
                      parts: ["title"],
                      original: "this.title",
                      loc: {
                        source: "source",
                        start: { line: 7, column: 6 },
                        end: { line: 7, column: 16 },
                      },
                    },
                    params: [],
                    hash: {
                      type: "Hash",
                      pairs: [],
                      loc: {
                        source: "source",
                        start: { line: 7, column: 16 },
                        end: { line: 7, column: 18 },
                      },
                    },
                    escaped: true,
                    strip: { open: false, close: false },
                    loc: {
                      source: "source",
                      start: { line: 7, column: 4 },
                      end: { line: 7, column: 18 },
                    },
                  },
                },
                {
                  kind: "mustache",
                  path: {
                    type: "PathExpression",
                    data: false,
                    depth: 1,
                    parts: ["name"],
                    original: "../name",
                    loc: {
                      source: "source",
                      start: { line: 7, column: 21 },
                      end: { line: 7, column: 28 },
                    },
                  },
                  params: [],
                  original: {
                    type: "MustacheStatement",
                    path: {
                      type: "PathExpression",
                      data: false,
                      depth: 1,
                      parts: ["name"],
                      original: "../name",
                      loc: {
                        source: "source",
                        start: { line: 7, column: 21 },
                        end: { line: 7, column: 28 },
                      },
                    },
                    params: [],
                    hash: {
                      type: "Hash",
                      pairs: [],
                      loc: {
                        source: "source",
                        start: { line: 7, column: 28 },
                        end: { line: 7, column: 30 },
                      },
                    },
                    escaped: true,
                    strip: { open: false, close: false },
                    loc: {
                      source: "source",
                      start: { line: 7, column: 19 },
                      end: { line: 7, column: 30 },
                    },
                  },
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
                    loc: {
                      source: "source",
                      start: { line: 10, column: 16 },
                      end: { line: 10, column: 20 },
                    },
                  },
                  params: [],
                  original: {
                    type: "MustacheStatement",
                    path: {
                      type: "PathExpression",
                      data: false,
                      depth: 0,
                      parts: ["name"],
                      original: "name",
                      loc: {
                        source: "source",
                        start: { line: 10, column: 16 },
                        end: { line: 10, column: 20 },
                      },
                    },
                    params: [],
                    hash: {
                      type: "Hash",
                      pairs: [],
                      loc: {
                        source: "source",
                        start: { line: 10, column: 20 },
                        end: { line: 10, column: 22 },
                      },
                    },
                    escaped: true,
                    strip: { open: false, close: false },
                    loc: {
                      source: "source",
                      start: { line: 10, column: 14 },
                      end: { line: 10, column: 22 },
                    },
                  },
                },
              ],
              original: {
                type: "BlockStatement",
                openStrip: {
                  open: false,
                  close: false,
                },
                closeStrip: {
                  open: false,
                  close: false,
                },
                inverseStrip: {
                  open: false,
                  close: false,
                },
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["each"],
                  original: "each",
                  loc: {
                    source: "source",
                    start: { line: 6, column: 3 },
                    end: { line: 6, column: 7 },
                  },
                },
                params: [
                  {
                    type: "PathExpression",
                    loc: {
                      source: "source",
                      start: { line: 6, column: 9 },
                      end: { line: 6, column: 14 },
                    },
                  },
                ],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 6, column: 9 },
                    end: { line: 6, column: 14 },
                  },
                },
                program: null,
                inverse: null,
                loc: {
                  source: "source",
                  start: { line: 6, column: 0 },
                  end: { line: 11, column: 9 },
                },
              },
            },
          },
          {
            pathExpr: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["title"],
              original: "this.title",
              loc: {
                source: "source",
                start: { line: 7, column: 6 },
                end: { line: 7, column: 16 },
              },
            },
            blockStatementStack: [
              {
                helper: "each",
                resolvedSelector: ["items"],
                isEach: true,
              },
            ],
            mustache: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["title"],
                original: "this.title",
                loc: {
                  source: "source",
                  start: { line: 7, column: 6 },
                  end: { line: 7, column: 16 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["title"],
                  original: "this.title",
                  loc: {
                    source: "source",
                    start: { line: 7, column: 6 },
                    end: { line: 7, column: 16 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 7, column: 16 },
                    end: { line: 7, column: 18 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 7, column: 4 },
                  end: { line: 7, column: 18 },
                },
              },
            },
            origin: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["title"],
                original: "this.title",
                loc: {
                  source: "source",
                  start: { line: 7, column: 6 },
                  end: { line: 7, column: 16 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["title"],
                  original: "this.title",
                  loc: {
                    source: "source",
                    start: { line: 7, column: 6 },
                    end: { line: 7, column: 16 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 7, column: 16 },
                    end: { line: 7, column: 18 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 7, column: 4 },
                  end: { line: 7, column: 18 },
                },
              },
            },
          },
          {
            pathExpr: {
              type: "PathExpression",
              data: false,
              depth: 1,
              parts: ["name"],
              original: "../name",
              loc: {
                source: "source",
                start: { line: 7, column: 21 },
                end: { line: 7, column: 28 },
              },
            },
            blockStatementStack: [
              {
                helper: "each",
                resolvedSelector: ["items"],
                isEach: true,
              },
            ],
            mustache: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 1,
                parts: ["name"],
                original: "../name",
                loc: {
                  source: "source",
                  start: { line: 7, column: 21 },
                  end: { line: 7, column: 28 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 1,
                  parts: ["name"],
                  original: "../name",
                  loc: {
                    source: "source",
                    start: { line: 7, column: 21 },
                    end: { line: 7, column: 28 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 7, column: 28 },
                    end: { line: 7, column: 30 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 7, column: 19 },
                  end: { line: 7, column: 30 },
                },
              },
            },
            origin: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 1,
                parts: ["name"],
                original: "../name",
                loc: {
                  source: "source",
                  start: { line: 7, column: 21 },
                  end: { line: 7, column: 28 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 1,
                  parts: ["name"],
                  original: "../name",
                  loc: {
                    source: "source",
                    start: { line: 7, column: 21 },
                    end: { line: 7, column: 28 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 7, column: 28 },
                    end: { line: 7, column: 30 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 7, column: 19 },
                  end: { line: 7, column: 30 },
                },
              },
            },
          },
          {
            pathExpr: {
              type: "PathExpression",
              data: false,
              depth: 0,
              parts: ["name"],
              original: "name",
              loc: {
                source: "source",
                start: { line: 10, column: 16 },
                end: { line: 10, column: 20 },
              },
            },
            blockStatementStack: [],
            mustache: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["name"],
                original: "name",
                loc: {
                  source: "source",
                  start: { line: 10, column: 16 },
                  end: { line: 10, column: 20 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["name"],
                  original: "name",
                  loc: {
                    source: "source",
                    start: { line: 10, column: 16 },
                    end: { line: 10, column: 20 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 10, column: 20 },
                    end: { line: 10, column: 22 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 10, column: 14 },
                  end: { line: 10, column: 22 },
                },
              },
            },
            origin: {
              kind: "mustache",
              path: {
                type: "PathExpression",
                data: false,
                depth: 0,
                parts: ["name"],
                original: "name",
                loc: {
                  source: "source",
                  start: { line: 10, column: 16 },
                  end: { line: 10, column: 20 },
                },
              },
              params: [],
              original: {
                type: "MustacheStatement",
                path: {
                  type: "PathExpression",
                  data: false,
                  depth: 0,
                  parts: ["name"],
                  original: "name",
                  loc: {
                    source: "source",
                    start: { line: 10, column: 16 },
                    end: { line: 10, column: 20 },
                  },
                },
                params: [],
                hash: {
                  type: "Hash",
                  pairs: [],
                  loc: {
                    source: "source",
                    start: { line: 10, column: 20 },
                    end: { line: 10, column: 22 },
                  },
                },
                escaped: true,
                strip: { open: false, close: false },
                loc: {
                  source: "source",
                  start: { line: 10, column: 14 },
                  end: { line: 10, column: 22 },
                },
              },
            },
          },
        ] as ReturnType<typeof extractHandlebarsPathExpressions>,
      },
    },
  },
] satisfies {
  testInput: {
    data: PathExpressionTreeNode[];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: ReturnType<typeof extractHandlebarsPathExpressions>;
    };
  };
}[];

describe("extractHandlebarsPathExpressions", () => {
  for (const { testInput, testOutcome } of testCasesForExtractHandlebarsPathExpressions) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const handlebarsPathExpressions = extractHandlebarsPathExpressions(testInput.data);
      expect(handlebarsPathExpressions).toEqual(testOutcome.data.result);
    });
  }
});
