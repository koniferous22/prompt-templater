import fs from "node:fs/promises";

import { Result } from "neverthrow";
import { match } from "ts-pattern";

import { TemplateEngine } from "../../../constants/enums/templateEngines/templateEngine.js";
import { createError } from "../../../utils/deps/neverthrow/errorFactory.js";
import { appErrAsyncFromThrowable } from "../../../utils/deps/neverthrow/errorFromThrowable.js";
import type { TemplateResourceFile } from "../../../validation/resourceFile/template/codecs/resourceAbsolutePathToResourceFile.js";
import type { ConfigResourceTypes } from "../config/factories/resourceFactories.js";
import { templateResourceFactories } from "./factories/resourceFactories.js";

export const templateResourceFromResourceFile = async (
  templateResourceFile: TemplateResourceFile,
  dependencies: {
    sourceWorkflow: ConfigResourceTypes["workflow"];
  },
) => {
  const fileReadResult = await appErrAsyncFromThrowable(
    async () => {
      return fs.readFile(templateResourceFile.file, "utf-8");
    },
    () => {
      return createError("module_resources_template_resourceFromResourceFile_errorReadingFile", {
        value: templateResourceFile.file,
      });
    },
  )();
  if (!fileReadResult.isOk()) {
    return fileReadResult as Result<never, typeof fileReadResult.error>;
  }
  const rawContents = fileReadResult.value;
  return match(templateResourceFile)
    .with({ format: "handlebars" }, () => {
      return templateResourceFactories.template(
        rawContents,
        TemplateEngine.Handlebars,
        dependencies,
        {
          file: templateResourceFile.file,
        },
      );
    })
    .exhaustive();
};
