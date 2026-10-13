import path from "node:path";

import { ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import { zodIssueFromAppError } from "../../../utils/deps/zod/zodIssueFromAppError.js";
import { AbsolutePathSchema } from "../../customTypes/path.js";
import { ConfigResourceAbsolutePathSchema } from "../../schemas/resources/config/utils/configResourceAbsolutePath.js";

export const AbsolutePathToConfigResourceAbsolutePath = z.codec(
  AbsolutePathSchema,
  ConfigResourceAbsolutePathSchema,
  {
    decode: (value, ctx) => {
      const extname = path.extname(value);
      const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;
      const resourceResult = match(fileExtension)
        .with("json", () =>
          ok({
            format: "json" as const,
            path: value,
          }),
        )
        .with("yaml", () =>
          ok({
            format: "yaml" as const,
            path: value,
          }),
        )
        .otherwise(() => {
          return appErr(
            "validation_codec_configResources_absolutePathToResourceAbsolutePath_invalidExtension",
            {
              resourceInput: value,
              allowedExtensions: ["json", "yaml", "yml"],
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
