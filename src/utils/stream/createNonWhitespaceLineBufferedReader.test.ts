import assert from "node:assert";
import { describe, it } from "node:test";
import { Readable } from "stream";

import { createNonWhitespaceLineBufferedReader } from "./createNonWhitespaceLineBufferedReader.js";

function createStreamFromLines(lines: string[]): Readable {
  const content = lines.map((line) => line + "\n").join("");
  return Readable.from([content]);
}

const testCasesForCreateNonWhitespaceLineBufferedReader = [
  {
    testInput: {
      data: [],
      testCaseDescription: "empty stream (immediate EOF)",
    },
    testOutcome: {
      testBehaviourDescription: "yield a single eof event with no trailing whitespace lines",
      data: {
        result: [
          {
            type: "eof",
            trailingWhitespaceLines: [],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: [""],
      testCaseDescription: "single empty line then EOF",
    },
    testOutcome: {
      testBehaviourDescription: "yield eof with one trailing whitespace line",
      data: {
        result: [
          {
            type: "eof",
            trailingWhitespaceLines: [""],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["   ", "\t", ""],
      testCaseDescription: "multiple whitespace-only lines (spaces, tab, empty) then EOF",
    },
    testOutcome: {
      testBehaviourDescription:
        "yield eof with all whitespace lines preserved untrimmed as trailingWhitespaceLines",
      data: {
        result: [
          {
            type: "eof",
            trailingWhitespaceLines: ["   ", "\t", ""],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["hello"],
      testCaseDescription: "single non-whitespace line",
    },
    testOutcome: {
      testBehaviourDescription:
        "yield one line event with empty whitespaceLines followed by eof with no trailing whitespace lines",
      data: {
        result: [
          {
            type: "line",
            whitespaceLines: [],
            line: "hello",
          },
          {
            type: "eof",
            trailingWhitespaceLines: [],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["  ", "\t\t", "first"],
      testCaseDescription: "two whitespace lines followed by a non-whitespace line",
    },
    testOutcome: {
      testBehaviourDescription:
        "buffer the whitespace lines (untrimmed) and attach them to the following non-whitespace line, then eof with no trailing whitespace lines",
      data: {
        result: [
          {
            type: "line",
            whitespaceLines: ["  ", "\t\t"],
            line: "first",
          },
          {
            type: "eof",
            trailingWhitespaceLines: [],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["alpha", "   ", "beta"],
      testCaseDescription: "non-whitespace, whitespace-only, non-whitespace",
    },
    testOutcome: {
      testBehaviourDescription:
        "yield first line with no whitespaceLines, then second line with one preceding whitespace line (untrimmed), then eof with no trailing whitespace lines",
      data: {
        result: [
          {
            type: "line",
            whitespaceLines: [],
            line: "alpha",
          },
          {
            type: "line",
            whitespaceLines: ["   "],
            line: "beta",
          },
          {
            type: "eof",
            trailingWhitespaceLines: [],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["one", "two", "three"],
      testCaseDescription: "multiple consecutive non-whitespace lines",
    },
    testOutcome: {
      testBehaviourDescription:
        "yield each non-whitespace line with empty whitespaceLines array, then eof with no trailing whitespace lines",
      data: {
        result: [
          {
            type: "line",
            whitespaceLines: [],
            line: "one",
          },
          {
            type: "line",
            whitespaceLines: [],
            line: "two",
          },
          {
            type: "line",
            whitespaceLines: [],
            line: "three",
          },
          {
            type: "eof",
            trailingWhitespaceLines: [],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["start", " ", "\t", "middle", "  ", "end", "", "   "],
      testCaseDescription:
        "mixed non-whitespace lines with whitespace lines in between and trailing whitespace",
    },
    testOutcome: {
      testBehaviourDescription:
        "attach preceding whitespace lines (untrimmed) to each non-whitespace line and emit remaining whitespace lines on eof",
      data: {
        result: [
          {
            type: "line",
            whitespaceLines: [],
            line: "start",
          },
          {
            type: "line",
            whitespaceLines: [" ", "\t"],
            line: "middle",
          },
          {
            type: "line",
            whitespaceLines: ["  "],
            line: "end",
          },
          {
            type: "eof",
            trailingWhitespaceLines: ["", "   "],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["\t", "only-non-whitespace", "  "],
      testCaseDescription: "leading whitespace, single non-whitespace, trailing whitespace",
    },
    testOutcome: {
      testBehaviourDescription:
        "attach leading whitespace line (untrimmed) to the non-whitespace line and put the trailing whitespace on eof",
      data: {
        result: [
          {
            type: "line",
            whitespaceLines: ["\t"],
            line: "only-non-whitespace",
          },
          {
            type: "eof",
            trailingWhitespaceLines: ["  "],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["  hello  "],
      testCaseDescription: "non-whitespace line that itself contains leading/trailing spaces",
    },
    testOutcome: {
      testBehaviourDescription:
        "treat the line as non-whitespace (because trim is non-empty) and yield it untrimmed with empty whitespaceLines",
      data: {
        result: [
          {
            type: "line",
            whitespaceLines: [],
            line: "  hello  ",
          },
          {
            type: "eof",
            trailingWhitespaceLines: [],
          },
        ],
      },
    },
  },
  {
    testInput: {
      data: ["", "   ", "  content with spaces  ", "\t", ""],
      testCaseDescription:
        "leading whitespace, non-whitespace with internal spaces, trailing whitespace",
    },
    testOutcome: {
      testBehaviourDescription:
        "buffer leading whitespace lines untrimmed onto the content line and emit trailing whitespace lines on eof; content line remains untrimmed",
      data: {
        result: [
          {
            type: "line",
            whitespaceLines: ["", "   "],
            line: "  content with spaces  ",
          },
          {
            type: "eof",
            trailingWhitespaceLines: ["\t", ""],
          },
        ],
      },
    },
  },
] satisfies {
  testInput: {
    data: string[];
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
    data: {
      result: Array<
        | { type: "line"; whitespaceLines: string[]; line: string }
        | { type: "eof"; trailingWhitespaceLines: string[] }
      >;
    };
  };
}[];

describe("createNonWhitespaceLineBufferedReader", () => {
  for (const { testInput, testOutcome } of testCasesForCreateNonWhitespaceLineBufferedReader) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const stream = createStreamFromLines(testInput.data);
      const nonWhitespaceLineBufferedReader = createNonWhitespaceLineBufferedReader(stream);

      const expected = testOutcome.data.result;
      let i = 0;
      for await (const item of nonWhitespaceLineBufferedReader) {
        assert.deepStrictEqual(item, expected[i]);
        i += 1;
      }
      assert.strictEqual(i, expected.length);
      assert.strictEqual(stream.destroyed, true);
    });
  }
});
