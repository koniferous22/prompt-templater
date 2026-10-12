import z from "zod";

import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";
import { AbsolutePathSchema, RelativePathSchema } from "../customTypes/path.js";
import { NonEmptyStringSchema } from "../customTypes/string.js";
import { ResourceUserInputSchema } from "../schemas/resources/resourceUserInput.js";

export const NonEmptyStringToResourceUserInputSchema = z.codec(
  NonEmptyStringSchema,
  ResourceUserInputSchema,
  {
    decode: (nonEmptyString, ctx) => {
      try {
        const absolutePathParseResult = AbsolutePathSchema.safeParse(nonEmptyString);
        return absolutePathParseResult.success
          ? {
              type: "absolute" as const,
              path: absolutePathParseResult.data,
            }
          : {
              type: "relative" as const,
              path: RelativePathSchema.parse(nonEmptyString),
            };
      } catch (err: any) {
        zodRegisterIssue(
          nonEmptyString,
          ctx,
          "validation_codec_nonEmptyStringToWorkflowUserInput_invalidInputData",
          {
            value: nonEmptyString,
          },
        );
        return z.NEVER;
      }
    },
    encode: async (data) => NonEmptyStringSchema.parse(data.path),
  },
);
