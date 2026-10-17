import path from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { zodIssueFromAppError } from "../../../../utils/deps/zod/zodIssueFromAppError.js";
import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import { TemplateResourceAbsolutePathSchema } from "../schemas/templateResourceAbsolutePath.js";

export const AbsolutePathToTemplateResourceAbsolutePath = z.codec(
  AbsolutePathSchema,
  TemplateResourceAbsolutePathSchema,
  {
    decode: (value, ctx) => {
      const extname = path.extname(value);
      const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;
      const resourceResult = match(fileExtension)
        .with("hbs", () =>
          ok({
            format: "handlebars" as const,
            path: value,
          }),
        )
        .otherwise(() => {
          return appErr(
            "validation_resourceReference_template_codecs_absolutePathToResourceAbsolutePath_invalidExtension",
            {
              resourceInput: value,
              allowedExtensions: ["hbs"],
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
      return AbsolutePathSchema.parse(value.path);
    },
  },
);
