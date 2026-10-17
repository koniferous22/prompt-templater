import fs from "node:fs/promises";

import Handlebars from "handlebars";
import { ok, Result } from "neverthrow";
import { match } from "ts-pattern";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import type { AppError } from "../../../utils/deps/neverthrow/types.js";
import type { TemplateResourceFile } from "../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";

// TODO - extract polyfill
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

// Note - generalize in similar manner to "configResourceFromResourceFile", in case there are multiple "template" resources with various schemas
export const templateResourceFromResourceFile = async (
  templateResourceFile: TemplateResourceFile,
): Promise<
  Result<
    (value: Record<string, any>) => string,
    | AppError<"module_resources_templateResourceFromResourceFile_errorReadingFile">
    | AppError<"module_resources_templateResourceFromResourceFile_invalidHandlebarsContents">
  >
> => {
  try {
    const rawContents = await fs.readFile(templateResourceFile.file, "utf-8");
    const parseResult = match(templateResourceFile)
      .with({ format: "handlebars" }, () => {
        try {
          // todo - create adapter layer in case implementing better templating language
          return ok(Handlebars.compile(rawContents));
        } catch (e: any) {
          return appErr(
            "module_resources_templateResourceFromResourceFile_invalidHandlebarsContents",
            {
              file: templateResourceFile.file,
            },
          );
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
