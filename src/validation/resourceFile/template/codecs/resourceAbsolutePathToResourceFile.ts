import { ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import { appErr, appErrAsync } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { zodIssueFromAppError } from "../../../../utils/deps/zod/zodIssueFromAppError.js";
import { HandlebarsFileSchema } from "../../../fs/codecs/absolutePathToFile/handlebars.js";
import { HandlebarsAbsolutePathSchema } from "../../../path/schemas/pathWithExtension.js";
import { TemplateResourceAbsolutePathSchema } from "../../../resourceReference/template/schemas/templateResourceAbsolutePath.js";

export const TemplateResourceFileSchema = z
  .codec(
    TemplateResourceAbsolutePathSchema,
    z.discriminatedUnion("format", [
      z.object({
        format: z.literal("handlebars"),
        file: HandlebarsFileSchema,
      }),
    ]),
    {
      decode: async (value, ctx) => {
        const result = await match(value)
          .with({ format: "handlebars" }, async (path) => {
            const handlebarsFileResult = await HandlebarsFileSchema.safeParseAsync(path.path);
            return handlebarsFileResult.success
              ? ok({
                  format: path.format,
                  file: handlebarsFileResult.data,
                })
              : appErrAsync(
                  "validation_resourceFile_template_codecs_resourceAbsolutePathToResourceFile_invalidHandlebarsFile",
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
          .with({ format: "handlebars" }, (path) => {
            const handlebarsAbsolutePathResult = HandlebarsAbsolutePathSchema.safeParse(path.file);
            return handlebarsAbsolutePathResult.success
              ? ok({
                  format: path.format,
                  path: handlebarsAbsolutePathResult.data,
                })
              : appErr(
                  "validation_resourceFile_template_codecs_resourceAbsolutePathToResourceFile_invalidHandlebarsPath",
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
  .brand<"TemplateResourceFile">();

export type TemplateResourceFile = z.output<typeof TemplateResourceFileSchema>;
