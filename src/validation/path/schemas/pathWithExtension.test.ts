import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expectTypeOf } from "expect-type";
import type z from "zod";

import {
  HandlebarsAbsolutePathSchema,
  HandlebarsRelativePathSchema,
  JsonAbsolutePathSchema,
  JsonRelativePathSchema,
  YamlAbsolutePathSchema,
  YamlRelativePathSchema,
  type HandlebarsAbsolutePath,
  type HandlebarsRelativePath,
  type JsonAbsolutePath,
  type JsonRelativePath,
  type YamlAbsolutePath,
  type YamlRelativePath,
} from "./pathWithExtension.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const testCasesForJsonAbsolutePathSchema = [
  {
    testInput: join(__dirname, "../../../../fixtures/workflows/test-workflow.json"),
    testOutcome: true,
  },
  {
    testInput: join(__dirname, "../../../../README.md"),
    testOutcome: false,
  },
  {
    testInput: join(__dirname, "../../../../fixtures"),
    testOutcome: false,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof JsonAbsolutePathSchema>;
  testOutcome: boolean;
}[];

describe("JsonAbsolutePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForJsonAbsolutePathSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = JsonAbsolutePathSchema.safeParse(testInput);
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<JsonAbsolutePath>();
      }
    });
  }
});

const testCasesForYamlAbsolutePathSchema = [
  {
    testInput: join(__dirname, "../../../../fixtures/workflows/test-workflow.yml"),
    testOutcome: true,
  },
  {
    testInput: join(__dirname, "../../../../README.md"),
    testOutcome: false,
  },
  {
    testInput: join(__dirname, "../../../../fixtures"),
    testOutcome: false,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof YamlAbsolutePathSchema>;
  testOutcome: boolean;
}[];

describe("YamlAbsolutePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForYamlAbsolutePathSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = YamlAbsolutePathSchema.safeParse(testInput);
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<YamlAbsolutePath>();
      }
    });
  }
});

const testCasesForHandlebarsAbsolutePathSchema = [
  {
    testInput: join(__dirname, "../../../../fixtures/templates/test-template.hbs"),
    testOutcome: true,
  },
  {
    testInput: join(__dirname, "../../../../README.md"),
    testOutcome: false,
  },
  {
    testInput: join(__dirname, "../../../../fixtures"),
    testOutcome: false,
  },
  {
    testInput: "not-absolute-path",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof HandlebarsAbsolutePathSchema>;
  testOutcome: boolean;
}[];

describe("HandlebarsAbsolutePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForHandlebarsAbsolutePathSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = HandlebarsAbsolutePathSchema.safeParse(testInput);
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<HandlebarsAbsolutePath>();
      }
    });
  }
});

const testCasesForJsonRelativePathSchema = [
  {
    testInput: "fixtures/workflows/test-workflow.json",
    testOutcome: true,
  },
  {
    testInput: "README.md",
    testOutcome: false,
  },
  {
    testInput: "fixtures",
    testOutcome: false,
  },
  {
    testInput: "/absolute/path",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof JsonRelativePathSchema>;
  testOutcome: boolean;
}[];

describe("JsonRelativePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForJsonRelativePathSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = JsonRelativePathSchema.safeParse(testInput);
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<JsonRelativePath>();
      }
    });
  }
});

const testCasesForYamlRelativePathSchema = [
  {
    testInput: "fixtures/workflows/test-workflow.yml",
    testOutcome: true,
  },
  {
    testInput: "README.md",
    testOutcome: false,
  },
  {
    testInput: "fixtures",
    testOutcome: false,
  },
  {
    testInput: "/absolute/path",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof YamlRelativePathSchema>;
  testOutcome: boolean;
}[];

describe("YamlRelativePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForYamlRelativePathSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = YamlRelativePathSchema.safeParse(testInput);
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<YamlRelativePath>();
      }
    });
  }
});

const testCasesForHandlebarsRelativePathSchema = [
  {
    testInput: "fixtures/templates/test-template.hbs",
    testOutcome: true,
  },
  {
    testInput: "README.md",
    testOutcome: false,
  },
  {
    testInput: "fixtures",
    testOutcome: false,
  },
  {
    testInput: "/absolute/path",
    testOutcome: false,
  },
] satisfies {
  testInput: z.input<typeof HandlebarsRelativePathSchema>;
  testOutcome: boolean;
}[];

describe("HandlebarsRelativePathSchema", () => {
  for (const { testInput, testOutcome } of testCasesForHandlebarsRelativePathSchema) {
    it(`for "${testInput}" parsing should return "${testOutcome}"`, async () => {
      const parsingResult = HandlebarsRelativePathSchema.safeParse(testInput);
      expect(parsingResult.success).toBe(testOutcome);
      if (parsingResult.success) {
        expectTypeOf(parsingResult.data).toEqualTypeOf<HandlebarsRelativePath>();
      }
    });
  }
});
