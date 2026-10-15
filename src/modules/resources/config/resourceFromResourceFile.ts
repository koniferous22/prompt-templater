import fs from "node:fs/promises";

import { YAML } from "bun";
import { ok, Result } from "neverthrow";
import { match } from "ts-pattern";
import type z from "zod";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import type { AppError } from "../../../utils/deps/neverthrow/types.js";
import type { ConfigResourceFile } from "../../../validation/resources/config/codecs/resourceAbsolutePathToResourceFile.js";
import {
  configResourceTypes,
  type ConfigResourceSchemaByResourceType,
  type ConfigResourceType,
} from "./resourceTypes.js";

export const configResourceFromResourceFile = async <
  ConfigResourceT extends ConfigResourceType,
  ConfigResourceSchema extends ConfigResourceSchemaByResourceType<ConfigResourceT> =
    ConfigResourceSchemaByResourceType<ConfigResourceT>,
>(
  type: ConfigResourceT,
  configResourceFile: ConfigResourceFile,
): Promise<
  Result<
    z.output<ConfigResourceSchema>,
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
    const validationResult = configResourceTypes[type].safeDecode(parseResult.value);
    if (!validationResult.success) {
    }
    return validationResult.success
      ? ok(validationResult.data)
      : appErr(
          "module_resources_configResourceFromResourceFile_invalidStructure",
          {
            file: configResourceFile.file,
            zodError: validationResult.error,
          },
          {
            cause: validationResult.error,
          },
        );
  } catch (err: unknown) {
    return appErr("module_resources_configResourceFromResourceFile_errorReadingFile", {
      value: configResourceFile.file,
    });
  }
};
