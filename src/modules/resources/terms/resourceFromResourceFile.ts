import fs from "node:fs/promises";

import { YAML } from "bun";
import { ok, Result } from "neverthrow";
import { match } from "ts-pattern";

import { createError } from "../../../utils/deps/neverthrow/errorFactory.js";
import { appErrAsyncFromThrowable } from "../../../utils/deps/neverthrow/errorFromThrowable.js";
import type { TermResourceFile } from "../../../validation/resourceFile/term/codecs/resourceAbsolutePathToResourceFile.js";
import type { TermValueType } from "../../../validation/resources/term/term/factories/termByTermType.js";
import { termResourceFactories } from "./factories/resourceFactories.js";
import { plaintextTermFileParser } from "./parsers/plaintextTermFileParser.js";
import { retrieveTermDataBySelector } from "./utils/retrieveDataBySelector.js";

export const termResourceFromResourceFile = async <TermType extends TermValueType>(
  termResourceFile: TermResourceFile,
  termType: TermType,
) => {
  const fileReadResult = await appErrAsyncFromThrowable(
    async () => {
      return fs.readFile(termResourceFile.file, "utf-8");
    },
    () => {
      return createError("module_resources_term_resourceFromResourceFile_errorReadingFile", {
        value: termResourceFile.file,
      });
    },
  )();
  if (!fileReadResult.isOk()) {
    return fileReadResult as Result<never, typeof fileReadResult.error>;
  }
  const rawContents = fileReadResult.value;
  const fileContentsParseResult = await match(termResourceFile)
    .with({ format: "json" }, async ({ file, selector }) => {
      const parsedJsonResult = await appErrAsyncFromThrowable(
        async () => {
          return JSON.parse(rawContents);
        },
        () => {
          return createError("module_resources_term_resourceFromResourceFile_invalidJsonContents", {
            file,
          });
        },
      )();
      if (!parsedJsonResult.isOk()) {
        return parsedJsonResult;
      }
      if (selector === null) {
        return ok(parsedJsonResult.value);
      }
      return retrieveTermDataBySelector(parsedJsonResult.value, selector, { file });
    })
    .with({ format: "yaml" }, async ({ file, selector }) => {
      const parsedYamlResult = await appErrAsyncFromThrowable(
        async () => {
          return YAML.parse(rawContents);
        },
        () => {
          return createError("module_resources_term_resourceFromResourceFile_invalidYamlContents", {
            file,
          });
        },
      )();
      if (!parsedYamlResult.isOk()) {
        return parsedYamlResult;
      }
      if (selector === null) {
        return ok(parsedYamlResult.value);
      }
      return retrieveTermDataBySelector(parsedYamlResult.value, selector, { file });
    })
    .with({ format: "plaintext" }, async ({ file: inputFile, options }) => {
      return plaintextTermFileParser(inputFile, options);
    })
    .exhaustive();
  if (!fileContentsParseResult.isOk()) {
    return fileContentsParseResult as Result<never, typeof fileContentsParseResult.error>;
  }
  return termResourceFactories.term<TermType>(termType, fileContentsParseResult.value, {
    file: termResourceFile.file,
  });
};
