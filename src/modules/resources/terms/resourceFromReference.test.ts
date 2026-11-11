import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { AbsolutePathSchema } from "../../../validation/path/customTypes/index.js";
import {
  TermResourceFileSchema,
  type TermResourceFile,
} from "../../../validation/resourceFile/term/codecs/resourceAbsolutePathToResourceFile.js";
import { PlainFileTermReferenceOptionsInputSchema } from "../../../validation/resourceReference/term/schemas/plainFileReferenceOptions.js";
import {
  TermResourceReferenceSchema,
  type TermResourceReference,
} from "../../../validation/resourceReference/term/schemas/termResourceReference.js";
import type { TermValueType } from "../../../validation/resources/term/term/factories/termByTermType.js";
import {
  WorkspaceContextSchema,
  type WorkspaceContext,
} from "../../../validation/workspaceContext/schemas/workspaceContext.js";
import { termResourceFromReference } from "./resourceFromReference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "unit-test-workspace"),
);

const testCasesForTermResourceFromReference = [
  {
    testInput: {
      data: {
        termType: "string",
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
        termType: "string",
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
        termType: "string",
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
        termType: "string",
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
        termType: "string",
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
        termType: "string",
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
        termType: "string",
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
        termType: "string",
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
        termType: "string",
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
        termType: "string",
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
      termType: TermValueType;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    data: TermResourceFile;
    testBehaviourDescription: string;
  };
}[];

describe("termResourceFromReference", () => {
  for (const { testInput, testOutcome } of testCasesForTermResourceFromReference) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const configResource = await termResourceFromReference(
        testInput.data.userInput,
        testInput.data.workspaceContext,
        testInput.data.termType,
      );
      assert.ok(configResource.isOk());
    });
  }
});
