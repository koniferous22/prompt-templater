import { pathFragmentVariant } from "../../utils/node/detectPlatformFeatures.js";
import { match } from "ts-pattern";
import type z from "zod";

export const {
  AbsolutePathSchema,
  PathFragmentSchema,
  RelativePathSchema,
} = await match(pathFragmentVariant)
  .with('posix', async () => {
    const {
      AbsolutePathSchema,
      PathFragmentSchema,
      RelativePathSchema,
    } = await import('./platform-specific/posix/path.js');
    return {
      AbsolutePathSchema,
      PathFragmentSchema,
      RelativePathSchema,
    };
  })
  .with('win32', async () => {
    const {
      AbsolutePathSchema,
      PathFragmentSchema,
      RelativePathSchema,
    } = await import('./platform-specific/win32/path.js');
    return {
      AbsolutePathSchema,
      PathFragmentSchema,
      RelativePathSchema,
    };
  })
  .exhaustive();
  
export type AbsolutePath = z.output<typeof AbsolutePathSchema>;
export type PathFragment = z.output<typeof PathFragmentSchema>;
export type RelativePath = z.output<typeof RelativePathSchema>;
