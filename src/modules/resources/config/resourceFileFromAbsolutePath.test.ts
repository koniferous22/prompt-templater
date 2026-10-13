import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  ConfigResourceFileSchema,
  type ConfigResourceFile,
} from "../../../validation/codecs/configResource/resourceAbsolutePathToResourceFile.js";
import { AbsolutePathSchema } from "../../../validation/customTypes/path.js";
import {
  ConfigResourceAbsolutePathSchema,
  type ConfigResourceAbsolutePath,
} from "../../../validation/schemas/resources/configResourceAbsolutePath.js";
import { WorkspaceContextSchema } from "../../../validation/schemas/workspaceContext.js";
import { configResourceFileFromAbsolutePath } from "./resourceFileFromAbsolutePath.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = AbsolutePathSchema.parse(join(__dirname, "../../../../"));
const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, "fixtures"));
const workspaceContext = await WorkspaceContextSchema.parseAsync(
  join(projectFixturesFolder, "workspace1"),
);

const testCasesForConfigResourceFileFromAbsolutePath = [
  {
    testInput: {
      data: ConfigResourceAbsolutePathSchema.parse({
        format: "json",
        path: join(workspaceContext, "workflows/test-workflow.json"),
      }),
      testCaseDescription: "absolute .json path",
    },
    testOutcome: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "json",
        path: join(workspaceContext, "workflows/test-workflow.json"),
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
  {
    testInput: {
      data: ConfigResourceAbsolutePathSchema.parse({
        format: "yaml",
        path: join(workspaceContext, "workflows/test-workflow.yml"),
      }),
      testCaseDescription: "absolute .yaml path",
    },
    testOutcome: {
      data: await ConfigResourceFileSchema.parseAsync({
        format: "yaml",
        path: join(workspaceContext, "workflows/test-workflow.yml"),
      }),
      testBehaviourDescription: "succeed with original absolute path",
    },
  },
] satisfies {
  testInput: {
    data: ConfigResourceAbsolutePath;
    testCaseDescription: string;
  };
  testOutcome: {
    data: ConfigResourceFile;
    testBehaviourDescription: string;
  };
}[];

describe("configResourceFileFromInput", () => {
  for (const { testInput, testOutcome } of testCasesForConfigResourceFileFromAbsolutePath) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      const resourceAbsolutePathResult = await configResourceFileFromAbsolutePath(testInput.data);
      assert.strictEqual(resourceAbsolutePathResult.isOk(), true);
      assert.deepEqual(
        resourceAbsolutePathResult.isOk() && resourceAbsolutePathResult.value,
        testOutcome.data,
      );
    });
  }
});
