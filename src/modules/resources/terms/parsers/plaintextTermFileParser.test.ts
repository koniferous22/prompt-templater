import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type z from "zod";

import { FileSchema, type File } from "../../../../validation/fs/schemas/file.js";
import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import type { PlainFileTermReferenceOptionsSchema } from "../../../../validation/resourceReference/term/schemas/plainFileReferenceOptions.js";
import {
  NonEmptyStringSchema,
  type NonEmptyString,
} from "../../../../validation/string/customTypes/string.js";
import { WorkspaceContextSchema } from "../../../../validation/workspaceContext/schemas/workspaceContext.js";
import { plaintextTermFileParser } from "./plaintextTermFileParser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const fixtures = {
  fixture1ValidFile: {
    file: await FileSchema.parseAsync(
      join(workspaceContext, "terms/plaintext-parser-test-fixture-1--normal-file.txt"),
    ),
    description: NonEmptyStringSchema.parse("valid file"),
  },
  fixture2LinesWithWhitespaces: {
    file: await FileSchema.parseAsync(
      join(
        workspaceContext,
        "terms/plaintext-parser-test-fixture-2--file-with-lines-containing-whitespaces.txt",
      ),
    ),
    description: NonEmptyStringSchema.parse("file with lines containing trailing whitespaces"),
  },
  fixture3EmptyLineInMiddle: {
    file: await FileSchema.parseAsync(
      join(
        workspaceContext,
        "terms/plaintext-parser-test-fixture-3--file-with-empty-line-in-middle.txt",
      ),
    ),
    description: NonEmptyStringSchema.parse("file with empty line in the middle"),
  },
  fixture4WhitespaceLineInMiddle: {
    file: await FileSchema.parseAsync(
      join(
        workspaceContext,
        "terms/plaintext-parser-test-fixture-4--file-with-whitespace-line-in-middle.txt",
      ),
    ),
    description: NonEmptyStringSchema.parse("file with whitespace line in the middle"),
  },
  fixture5EmptyTrailingLine: {
    file: await FileSchema.parseAsync(
      join(
        workspaceContext,
        "terms/plaintext-parser-test-fixture-5--file-with-trailing-empty-line.txt",
      ),
    ),
    description: NonEmptyStringSchema.parse("file with empty trailing line"),
  },
  fixture6WhitespaceTrailingLine: {
    file: await FileSchema.parseAsync(
      join(
        workspaceContext,
        "terms/plaintext-parser-test-fixture-6--file-with-trailing-whitespace-line.txt",
      ),
    ),
    description: NonEmptyStringSchema.parse("file with whitespace trailing line"),
  },
} satisfies Record<
  string,
  {
    file: File;
    description: NonEmptyString;
  }
>;

const configurations: {
  configuration: Omit<z.output<typeof PlainFileTermReferenceOptionsSchema>, "strict">;
  fixtureTreatment: Record<
    keyof typeof fixtures,
    | {
        success: true;
        parsedLines: string[];
      }
    | {
        success: false;
      }
  >;
}[] = [
  {
    configuration: {
      whitespaceLines: "allow",
      trimWhitespace: false,
    },
    fixtureTreatment: {
      fixture1ValidFile: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture2LinesWithWhitespaces: {
        success: true,
        parsedLines: ["option1  ", "  option2", "option3"],
      },
      fixture3EmptyLineInMiddle: {
        success: true,
        parsedLines: ["option1", "option2", "", "option3"],
      },
      fixture4WhitespaceLineInMiddle: {
        success: true,
        parsedLines: ["option1", "    ", "option2", "option3"],
      },
      fixture5EmptyTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture6WhitespaceTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3", "   "],
      },
    },
  },
  {
    configuration: {
      whitespaceLines: "allow",
      trimWhitespace: true,
    },
    fixtureTreatment: {
      fixture1ValidFile: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture2LinesWithWhitespaces: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture3EmptyLineInMiddle: {
        success: true,
        parsedLines: ["option1", "option2", "", "option3"],
      },
      fixture4WhitespaceLineInMiddle: {
        success: true,
        parsedLines: ["option1", "", "option2", "option3"],
      },
      fixture5EmptyTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture6WhitespaceTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3", ""],
      },
    },
  },
  {
    configuration: {
      whitespaceLines: "skip",
      trimWhitespace: false,
    },
    fixtureTreatment: {
      fixture1ValidFile: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture2LinesWithWhitespaces: {
        success: true,
        parsedLines: ["option1  ", "  option2", "option3"],
      },
      fixture3EmptyLineInMiddle: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture4WhitespaceLineInMiddle: {
        success: true,
        parsedLines: ["option1", "    ", "option2", "option3"],
      },
      fixture5EmptyTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture6WhitespaceTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3", "   "],
      },
    },
  },
  {
    configuration: {
      whitespaceLines: "skip",
      trimWhitespace: true,
    },
    fixtureTreatment: {
      fixture1ValidFile: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture2LinesWithWhitespaces: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture3EmptyLineInMiddle: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture4WhitespaceLineInMiddle: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture5EmptyTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture6WhitespaceTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
    },
  },
  {
    configuration: {
      whitespaceLines: "skipTrailing",
      trimWhitespace: false,
    },
    fixtureTreatment: {
      fixture1ValidFile: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture2LinesWithWhitespaces: {
        success: true,
        parsedLines: ["option1  ", "  option2", "option3"],
      },
      fixture3EmptyLineInMiddle: {
        success: false,
      },
      fixture4WhitespaceLineInMiddle: {
        success: false,
      },
      fixture5EmptyTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture6WhitespaceTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3", "   "],
      },
    },
  },
  {
    configuration: {
      whitespaceLines: "skipTrailing",
      trimWhitespace: true,
    },
    fixtureTreatment: {
      fixture1ValidFile: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture2LinesWithWhitespaces: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture3EmptyLineInMiddle: {
        success: false,
      },
      fixture4WhitespaceLineInMiddle: {
        success: false,
      },
      fixture5EmptyTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture6WhitespaceTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
    },
  },
  {
    configuration: {
      whitespaceLines: "fail",
      trimWhitespace: false,
    },
    fixtureTreatment: {
      fixture1ValidFile: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture2LinesWithWhitespaces: {
        success: true,
        parsedLines: ["option1  ", "  option2", "option3"],
      },
      fixture3EmptyLineInMiddle: {
        success: false,
      },
      fixture4WhitespaceLineInMiddle: {
        success: false,
      },
      // For some reason succeeds - built-in `readline` ignores trailing line
      fixture5EmptyTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture6WhitespaceTrailingLine: {
        success: false,
      },
    },
  },
  {
    configuration: {
      whitespaceLines: "fail",
      trimWhitespace: true,
    },
    fixtureTreatment: {
      fixture1ValidFile: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture2LinesWithWhitespaces: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture3EmptyLineInMiddle: {
        success: false,
      },
      fixture4WhitespaceLineInMiddle: {
        success: false,
      },
      // For some reason succeeds - built-in `readline` ignores trailing line
      fixture5EmptyTrailingLine: {
        success: true,
        parsedLines: ["option1", "option2", "option3"],
      },
      fixture6WhitespaceTrailingLine: {
        success: false,
      },
    },
  },
];

const testCasesForPlaintextFileParser = configurations.flatMap(
  ({ configuration, fixtureTreatment }) => {
    return Object.entries(fixtureTreatment).map(([key, value]) => {
      const stringifiedConfiguration = JSON.stringify(configuration);
      const fixture = fixtures[key as keyof typeof fixtures];
      return {
        testInput: {
          data: {
            configuration,
            inputFile: fixture.file,
          },
          testCaseDescription: `${fixture.description} and parser config ${stringifiedConfiguration}`,
        },
        testOutcome: {
          testBehaviourDescription: value.success ? "succeed" : "fail",
          data: value,
        },
      };
    });
  },
);

describe("plaintextTermFileParser", () => {
  for (const { testInput, testOutcome } of testCasesForPlaintextFileParser) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const result = await plaintextTermFileParser(testInput.data.inputFile, {
        ...testInput.data.configuration,
        strict: false,
      });
      if (testOutcome.data.success === true) {
        assert.ok(result.isOk());
        assert.deepEqual(result.value, testOutcome.data.parsedLines);
      } else {
        assert.ok(result.isErr());
      }
    });
  }
});
