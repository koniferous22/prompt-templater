import z from "zod";
import { AbsolutePathSchema, RelativePathSchema } from "../customTypes/path.js";
import { NonEmptyStringSchema } from "../customTypes/string.js";
import { zodRegisterIssue } from "../../utils/deps/zod/zodRegisterIssue.js";

const CodecOutputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('absolute'),
    path: AbsolutePathSchema,
  }),
  z.object({
    type: z.literal('relative'),
    path: RelativePathSchema,
  }),
]);

export const NonEmptyStringToAbsoluteOrRelativePath = z.codec(
  NonEmptyStringSchema,
  CodecOutputSchema,
  {
    decode: (nonEmptyString, ctx) => {
      try {
        const absolutePathParseResult = AbsolutePathSchema.safeParse(nonEmptyString);
        return absolutePathParseResult.success ?
          {
            type: 'absolute' as const,
            path: absolutePathParseResult.data,
          } :
          {
            type: 'relative' as const,
            path: RelativePathSchema.parse(nonEmptyString),
          };
      } catch (err: any) {
        zodRegisterIssue(
          nonEmptyString,
          ctx,
          'validation_codec_nonEmptyStringToAbsoluteOrRelativePath_invalidInputData',
          {
            value: nonEmptyString,
          },
        );
        return z.NEVER;
      }
    },
    encode: async (data) => NonEmptyStringSchema.parse(data.path),
  }
);
