import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import {
  TermResourceFileSchema,
  type TermResourceFile,
} from "../../../../validation/resourceFile/term/codecs/resourceAbsolutePathToResourceFile.js";
import { PlainFileTermReferenceOptionsInputSchema } from "../../../../validation/resourceReference/term/schemas/plainFileReferenceOptions.js";
import {
  TermResourceReferenceSchema,
  type TermResourceReference,
} from "../../../../validation/resourceReference/term/schemas/termResourceReference.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../../validation/workspaceContext/schemas/workspaceContext.js";
import { termResourceFileFromReference } from "./resourceFileFromReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForTermResourceFileFromReference = [
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "json",
            path: join(workspaceContext, "terms/test-term.json"),
            selector: null,
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .json path",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "terms/test-term.json"),
        selector: null,
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "json",
            path: join(workspaceContext, "terms/test-term-nested.json"),
            selector: [0, "someAttribute"],
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .json path with selector",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "terms/test-term-nested.json"),
        selector: [0, "someAttribute"],
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "yaml",
            path: join(workspaceContext, "terms/test-term.yml"),
            selector: null,
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .yaml path",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "terms/test-term.yml"),
        selector: null,
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "yaml",
            path: join(workspaceContext, "terms/test-term-nested.yml"),
            selector: ["someAttribute", 0, "someNestedAttribute"],
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute .yaml path with selector",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "terms/test-term-nested.yml"),
        selector: ["someAttribute", 0, "someNestedAttribute"],
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "absolute",
          filePath: {
            format: "plaintext",
            path: join(workspaceContext, "terms/test-term.txt"),
            options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "absolute plaintext path",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "plaintext",
        path: join(workspaceContext, "terms/test-term.txt"),
        options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "terms/test-term.json",
            selector: null,
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .json path",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "terms/test-term.json"),
        selector: null,
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "json",
            path: "terms/test-term-nested.json",
            selector: [0, "someAttribute"],
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .json path with selector",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "terms/test-term-nested.json"),
        selector: [0, "someAttribute"],
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "yaml",
            path: "terms/test-term.yml",
            selector: null,
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .yaml path",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "terms/test-term.yml"),
        selector: null,
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "yaml",
            path: "terms/test-term-nested.yml",
            selector: ["someAttribute", 0, "someNestedAttribute"],
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative .yaml path with selector",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "terms/test-term-nested.yml"),
        selector: ["someAttribute", 0, "someNestedAttribute"],
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
  {
    testInput: {
      data: {
        userInput: TermResourceReferenceSchema.parse({
          type: "relative",
          filePath: {
            format: "plaintext",
            path: "terms/test-term.txt",
            options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
          },
        }),
        workspaceContext,
      },
      testCaseDescription: "relative plaintext path",
    },
    testOutcome: {
      data: await TermResourceFileSchema.parseAsync({
        format: "plaintext",
        path: join(workspaceContext, "terms/test-term.txt"),
        options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
      }),
      testBehaviourDescription: "succeed with concatenated relative path to workspace context",
    },
  },
] satisfies {
  testInput: {
    data: {
      userInput: TermResourceReference;
      workspaceContext: WorkspaceContext;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: TermResourceFile;
    testBehaviourDescription: string;
  };
}[];

describe("termResourceFileFromReference", () => {
  for (const { testInput, testOutcome } of testCasesForTermResourceFileFromReference) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceAbsolutePathResult = await termResourceFileFromReference(
        testInput.data.userInput,
        testInput.data.workspaceContext,
      );
      assert.strictEqual(resourceAbsolutePathResult.isOk(), true);
      assert.deepEqual(
        resourceAbsolutePathResult.isOk() && resourceAbsolutePathResult.value,
        testOutcome.data,
      );
    });
  }
});
