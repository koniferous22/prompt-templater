import { ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import { appErr, appErrAsync } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { zodIssueFromAppError } from "../../../../utils/deps/zod/zodIssueFromAppError.js";
import { JsonFileSchema } from "../../../fs/codecs/absolutePathToFile/json.js";
import { YamlFileSchema } from "../../../fs/codecs/absolutePathToFile/yaml.js";
import {
  JsonAbsolutePathSchema,
  YamlAbsolutePathSchema,
} from "../../../path/schemas/pathWithExtension.js";
import { ConfigResourceAbsolutePathSchema } from "../../../resourceReference/config/schemas/configResourceAbsolutePath.js";

export const ConfigResourceFileSchema = z
  .codec(
    ConfigResourceAbsolutePathSchema,
    z.discriminatedUnion("format", [
      z.object({
        format: z.literal("json"),
        file: JsonFileSchema,
      }),
      z.object({
        format: z.literal("yaml"),
        file: YamlFileSchema,
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
                })
              : appErrAsync(
                  "validation_resourceFile_config_codecs_resourceAbsolutePathToResourceFile_invalidJsonFile",
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
                })
              : appErrAsync(
                  "validation_resourceFile_config_codecs_resourceAbsolutePathToResourceFile_invalidYamlFile",
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
      // Note - "encode" doesn't work because of use of `.transform` within FileSchema
      encode: (value, ctx) => {
        const result = match(value)
          .with({ format: "json" }, (path) => {
            const jsonAbsolutePathResult = JsonAbsolutePathSchema.safeParse(path.file);
            return jsonAbsolutePathResult.success
              ? ok({
                  format: path.format,
                  path: jsonAbsolutePathResult.data,
                })
              : appErr(
                  "validation_resourceFile_config_codecs_resourceAbsolutePathToResourceFile_invalidJsonPath",
                  {
                    value: path.file,
                  },
                );
          })
          .with({ format: "yaml" }, (path) => {
            const yamlAbsolutePathResult = YamlAbsolutePathSchema.safeParse(path.file);
            return yamlAbsolutePathResult.success
              ? ok({
                  format: path.format,
                  path: yamlAbsolutePathResult.data,
                })
              : appErr(
                  "validation_resourceFile_config_codecs_resourceAbsolutePathToResourceFile_invalidYamlPath",
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
  .brand<"ConfigResourceFile">();

export type ConfigResourceFile = z.output<typeof ConfigResourceFileSchema>;
