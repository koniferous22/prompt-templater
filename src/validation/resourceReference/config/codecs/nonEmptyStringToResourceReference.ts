import z from "zod";

import type { AppErrorCode } from "../../../../constants/errorCodes.js";
import type { AppError } from "../../../../utils/deps/neverthrow/types.js";
import { zodRegisterIssue } from "../../../../utils/deps/zod/zodRegisterIssue.js";
import { AbsolutePathSchema } from "../../../path/customTypes/path.js";
import { NonEmptyStringSchema } from "../../../string/customTypes/string.js";
import { ConfigResourceReferenceSchema } from "../schemas/configResourceReference.js";
import { AbsolutePathToConfigResourceAbsolutePath } from "./absolutePathToResourceAbsolutePath.js";
import { RelativePathToConfigResourceRelativePath } from "./relativePathToResourceRelativePath.js";

export const NonEmptyStringToConfigResourceReferenceSchema = z.codec(
  NonEmptyStringSchema,
  ConfigResourceReferenceSchema,
  {
    decode: (nonEmptyString, ctx) => {
      try {
        const absolutePathParseResult = AbsolutePathSchema.safeParse(nonEmptyString);
        if (absolutePathParseResult.success) {
          const resourceAbsolutePathResult = AbsolutePathToConfigResourceAbsolutePath.safeParse(
            absolutePathParseResult.data,
          );
          if (!resourceAbsolutePathResult.success) {
            for (const issue of resourceAbsolutePathResult.error.issues) {
              // Map inner custom zod issues
              if (issue.code === "custom") {
                zodRegisterIssue(
                  nonEmptyString,
                  ctx,
                  (issue.params as AppError<AppErrorCode>).code,
                  (issue.params as AppError<AppErrorCode>).meta,
                );
              }
            }
            return z.NEVER;
          }
          return {
            type: "absolute" as const,
            filePath: resourceAbsolutePathResult.data,
          };
        }
        const resourceRelativePathResult =
          RelativePathToConfigResourceRelativePath.safeParse(nonEmptyString);
        if (!resourceRelativePathResult.success) {
          // Map inner custom zod issues
          for (const issue of resourceRelativePathResult.error.issues) {
            if (issue.code === "custom") {
              zodRegisterIssue(
                nonEmptyString,
                ctx,
                (issue.params as AppError<AppErrorCode>).code,
                (issue.params as AppError<AppErrorCode>).meta,
              );
            }
          }
          return z.NEVER;
        }
        return {
          type: "relative" as const,
          filePath: resourceRelativePathResult.data,
        };
      } catch (err: any) {
        zodRegisterIssue(
          nonEmptyString,
          ctx,
          "validation_resourceReference_config_codecs_nonEmptyStringToResourceInput_invalidInputData",
          {
            value: nonEmptyString,
          },
        );
        return z.NEVER;
      }
    },
    encode: async (data) => NonEmptyStringSchema.parse(data.filePath.path),
  },
);
