import path from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { zodIssueFromAppError } from "../../../../utils/deps/zod/zodIssueFromAppError.js";
import { RelativePathSchema } from "../../../path/customTypes/path.js";
import { TemplateResourceRelativePathSchema } from "../schemas/templateResourceRelativePath.js";

export const RelativePathToTemplateResourceRelativePath = z.codec(
  RelativePathSchema,
  TemplateResourceRelativePathSchema,
  {
    decode: (value, ctx) => {
      const extname = path.extname(value);
      const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;
      const resourceResult = match(fileExtension)
        .with("pug", () =>
          ok({
            format: "pug" as const,
            path: value,
          }),
        )
        .otherwise(() => {
          return appErr(
            "validation_codec_configResources_relativePathToResourceRelativePath_invalidExtension",
            {
              resourceInput: value,
              allowedExtensions: ["pug"],
            },
          );
        });
      if (resourceResult.isOk()) {
        return resourceResult.value;
      }
      ctx.issues.push(
        zodIssueFromAppError(resourceResult.error, value, {
          path: [],
          continue: false,
        }),
      );
      return z.NEVER;
    },
    encode: (value) => {
      return RelativePathSchema.parse(value.path);
    },
  },
);
