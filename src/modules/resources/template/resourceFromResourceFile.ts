import fs from "node:fs/promises";

import { ok, Result } from "neverthrow";
import pug from "pug";
import { match } from "ts-pattern";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import type { AppError } from "../../../utils/deps/neverthrow/types.js";
import type { TemplateResourceFile } from "../../../validation/resources/template/codecs/resourceAbsolutePathToResourceFile.js";

// Note - generalize in similar manner to "configResourceFromResourceFile", in case there are multiple "template" resources with various schemas
export const templateResourceFromResourceFile = async (
  templateResourceFile: TemplateResourceFile,
): Promise<
  Result<
    (value: Record<string, any>) => string,
    | AppError<"module_resources_templateResourceFromResourceFile_errorReadingFile">
    | AppError<"module_resources_templateResourceFromResourceFile_invalidPugContents">
  >
> => {
  try {
    const rawContents = await fs.readFile(templateResourceFile.file, "utf-8");
    const parseResult = match(templateResourceFile)
      .with({ format: "pug" }, () => {
        try {
          // todo - create adapter layer in case implementing better templating language
          return ok(pug.compile(rawContents));
        } catch (e: any) {
          return appErr("module_resources_templateResourceFromResourceFile_invalidPugContents", {
            file: templateResourceFile.file,
          });
        }
      })
      .exhaustive();
    if (!parseResult.isOk()) {
      return parseResult;
    }
    return ok(parseResult.value);
  } catch (err: unknown) {
    return appErr("module_resources_templateResourceFromResourceFile_errorReadingFile", {
      value: templateResourceFile.file,
    });
  }
};
