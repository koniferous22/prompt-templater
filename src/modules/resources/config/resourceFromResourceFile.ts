import fs from "node:fs/promises";

import { YAML } from "bun";
import { ok, Result } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import type { AppError } from "../../../utils/deps/neverthrow/types.js";
import type { ConfigResourceFile } from "../../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import {
  configResourceFactories,
  configResourceSchemas,
  type ConfigResourceSchemaByResourceType,
  type ConfigResourceType,
  type ConfigResourceTypes,
} from "./types/resourceTypes.js";

export const configResourceFromResourceFile = async <
  ConfigResourceT extends ConfigResourceType,
  ConfigResource extends ConfigResourceTypes[ConfigResourceT] =
    ConfigResourceTypes[ConfigResourceT],
  ConfigResourceSchema extends ConfigResourceSchemaByResourceType<ConfigResourceT> =
    ConfigResourceSchemaByResourceType<ConfigResourceT>,
>(
  type: ConfigResourceT,
  configResourceFile: ConfigResourceFile,
): Promise<
  Result<
    ConfigResource,
    | AppError<"module_resources_configResourceFromResourceFile_errorReadingFile">
    | AppError<"module_resources_configResourceFromResourceFile_invalidJsonContents">
    | AppError<"module_resources_configResourceFromResourceFile_invalidStructure">
    | AppError<"module_resources_configResourceFromResourceFile_invalidYamlContents">
  >
> => {
  try {
    const rawContents = await fs.readFile(configResourceFile.file, "utf-8");
    const parseResult = match(configResourceFile)
      .with({ format: "json" }, () => {
        try {
          return ok(JSON.parse(rawContents));
        } catch (e: any) {
          return appErr("module_resources_configResourceFromResourceFile_invalidJsonContents", {
            file: configResourceFile.file,
          });
        }
      })
      .with({ format: "yaml" }, () => {
        try {
          return ok(YAML.parse(rawContents));
        } catch (e: any) {
          return appErr("module_resources_configResourceFromResourceFile_invalidYamlContents", {
            file: configResourceFile.file,
          });
        }
      })
      .exhaustive();
    if (!parseResult.isOk()) {
      return parseResult;
    }
    const validationResult = configResourceSchemas[type].safeDecode(parseResult.value);
    if (!validationResult.success) {
      return appErr(
        "module_resources_configResourceFromResourceFile_invalidStructure",
        {
          file: configResourceFile.file,
          zodError: validationResult.error,
        },
        {
          cause: validationResult.error,
        },
      );
    }
    const resourceData = validationResult.data;
    const resource = match(type as ConfigResourceType)
      .with("workflow", () => configResourceFactories.workflow(resourceData) as ConfigResource)
      .exhaustive();
    return ok(resource);
  } catch (err: unknown) {
    return appErr("module_resources_configResourceFromResourceFile_errorReadingFile", {
      value: configResourceFile.file,
    });
  }
};
