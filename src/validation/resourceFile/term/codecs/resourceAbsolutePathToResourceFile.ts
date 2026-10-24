import { ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import { appErr, appErrAsync } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { zodIssueFromAppError } from "../../../../utils/deps/zod/zodIssueFromAppError.js";
import { JsonFileSchema } from "../../../fs/codecs/absolutePathToFile/json.js";
import { YamlFileSchema } from "../../../fs/codecs/absolutePathToFile/yaml.js";
import { FileSchema } from "../../../fs/schemas/file.js";
import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import {
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../../path/schemas/pathWithExtension.js";
import { PlainFileTermReferenceOptionsSchema } from "../../../resourceReference/term/schemas/plainFileReferenceOptions.js";
import { SelectorSchema } from "../../../resourceReference/term/schemas/selector.js";
import { TermResourceAbsolutePathSchema } from "../../../resourceReference/term/schemas/termResourceAbsolutePath.js";

export const TermResourceFileSchema = z
  .codec(
    TermResourceAbsolutePathSchema,
    z.discriminatedUnion("format", [
      z.object({
        format: z.literal("json"),
        file: JsonFileSchema,
        selector: SelectorSchema.nullable(),
      }),
      z.object({
        format: z.literal("yaml"),
        file: YamlFileSchema,
        selector: SelectorSchema.nullable(),
      }),
      z.object({
        format: z.literal("plaintext"),
        file: FileSchema,
        options: PlainFileTermReferenceOptionsSchema,
      }),
    ]),
    {
      decode: async (value, ctx) => {
        const result = await match(value)
          .with({ format: "json" }, async (path) => {
            const jsonFileResult = await JsonFileSchema.safeParseAsync(path.path);
            return jsonFileResult.success
              ? ok({
                  format: path.format,
                  file: jsonFileResult.data,
                  selector: path.selector,
                })
              : appErrAsync(
                  "validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidJsonFile",
                  {
                    value: path.path,
                  },
                );
          })
          .with({ format: "yaml" }, async (path) => {
            const yamlFileResult = await YamlFileSchema.safeParseAsync(path.path);
            return yamlFileResult.success
              ? ok({
                  format: path.format,
                  file: yamlFileResult.data,
                  selector: path.selector,
                })
              : appErrAsync(
                  "validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidYamlFile",
                  {
                    value: path.path,
                  },
                );
          })
          .with({ format: "plaintext" }, async (path) => {
            const yamlFileResult = await FileSchema.safeParseAsync(path.path);
            return yamlFileResult.success
              ? ok({
                  format: path.format,
                  file: yamlFileResult.data,
                  options: path.options,
                })
              : appErrAsync(
                  "validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidPlaintextFile",
                  {
                    value: path.path,
                  },
                );
          })
          .exhaustive();
        if (!result.isOk()) {
          ctx.issues.push(zodIssueFromAppError(result.error, value));
          return z.NEVER;
        }
        return result.value;
      },
      encode: (value, ctx) => {
        const result = match(value)
          .with({ format: "json" }, (path) => {
            const jsonAbsolutePathResult = JsonAbsolutePathSchema.safeParse(path.file);
            if (!jsonAbsolutePathResult.success) {
              return appErr(
                "validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidJsonPath",
                {
                  value: path.file,
                },
              );
            }
            const selectorResult = SelectorSchema.safeParse(path.selector);
            if (!selectorResult.success) {
              return appErr(
                "validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidJsonSelector",
                {
                  value: path.selector,
                },
              );
            }
            return ok({
              format: path.format,
              path: jsonAbsolutePathResult.data,
              selector: selectorResult.data,
            });
          })
          .with({ format: "yaml" }, (path) => {
            const yamlAbsolutePathResult = YamlAbsolutePathSchema.safeParse(path.file);
            if (!yamlAbsolutePathResult.success) {
              return appErr(
                "validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidYamlPath",
                {
                  value: path.file,
                },
              );
            }
            const selectorResult = SelectorSchema.safeParse(path.selector);
            if (!selectorResult.success) {
              return appErr(
                "validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidYamlSelector",
                {
                  value: path.selector,
                },
              );
            }
            return ok({
              format: path.format,
              path: yamlAbsolutePathResult.data,
              selector: selectorResult.data,
            });
          })
          .with({ format: "plaintext" }, (path) => {
            const absolutePathResult = AbsolutePathSchema.safeParse(path.file);
            return absolutePathResult.success
              ? ok({
                  format: path.format,
                  path: absolutePathResult.data,
                  options: path.options,
                })
              : appErr(
                  "validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidPlaintextPath",
                  {
                    value: path.file,
                  },
                );
          })
          .exhaustive();
        if (!result.isOk()) {
          ctx.issues.push(zodIssueFromAppError(result.error, value));
          return z.NEVER;
        }
        return result.value;
      },
    },
  )
  .brand<"TermResourceFile">();

export type TermResourceFile = z.output<typeof TermResourceFileSchema>;
