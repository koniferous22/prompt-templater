import fs from "node:fs/promises";

import { YAML } from "bun";
import { Result } from "neverthrow";
import { match } from "ts-pattern";

import { createError } from "../../../utils/deps/neverthrow/errorFactory.js";
import { appErrAsyncFromThrowable } from "../../../utils/deps/neverthrow/errorFromThrowable.js";
import type { ConfigResourceFile } from "../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import { configResourceFactories, type ConfigResourceType } from "./factories/resourceFactories.js";

export const configResourceFromResourceFile = async <ConfigResourceT extends ConfigResourceType>(
  type: ConfigResourceT,
  configResourceFile: ConfigResourceFile,
) => {
  const fileReadResult = await appErrAsyncFromThrowable(
    async () => {
      return fs.readFile(configResourceFile.file, "utf-8");
    },
    () => {
      return createError("module_resources_config_resourceFromResourceFile_errorReadingFile", {
        value: configResourceFile.file,
      });
    },
  )();
  if (!fileReadResult.isOk()) {
    return fileReadResult as Result<never, typeof fileReadResult.error>;
  }
  const rawContents = fileReadResult.value;
  const fileContentsParseResult = await match(configResourceFile)
    .with({ format: "json" }, () => {
      return appErrAsyncFromThrowable(
        async () => {
          return JSON.parse(rawContents);
        },
        () => {
          return createError(
            "module_resources_config_resourceFromResourceFile_invalidJsonContents",
            {
              file: configResourceFile.file,
            },
          );
        },
      )();
    })
    .with({ format: "yaml" }, () => {
      return appErrAsyncFromThrowable(
        async () => {
          return YAML.parse(rawContents);
        },
        () => {
          return createError(
            "module_resources_config_resourceFromResourceFile_invalidYamlContents",
            {
              file: configResourceFile.file,
            },
          );
        },
      )();
    })
    .exhaustive();
  if (!fileContentsParseResult.isOk()) {
    return fileContentsParseResult as Result<never, typeof fileContentsParseResult.error>;
  }
  return match(type as ConfigResourceType)
    .with("workflow", () =>
      configResourceFactories.workflow(fileContentsParseResult.value, {
        file: configResourceFile.file,
      }),
    )
    .exhaustive();
};
