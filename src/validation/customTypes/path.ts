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
      AbsolutePathPosixSchema,
      PathFragmentPosixSchema,
      RelativePathPosixSchema,
    } = await import('./platform-specific/posix/path.js');
    return {
      AbsolutePathSchema: AbsolutePathPosixSchema,
      PathFragmentSchema: PathFragmentPosixSchema,
      RelativePathSchema: RelativePathPosixSchema,
    };
  })
  .with('win32', async () => {
    const {
      AbsolutePathWin32Schema,
      PathFragmentWin32Schema,
      RelativePathWin32Schema,
    } = await import('./platform-specific/win32/path.js');
    return {
      AbsolutePathSchema: AbsolutePathWin32Schema,
      PathFragmentSchema: PathFragmentWin32Schema,
      RelativePathSchema: RelativePathWin32Schema,
    };
  })
  .exhaustive();
  
export type AbsolutePath = z.output<typeof AbsolutePathSchema>;
export type PathFragment = z.output<typeof PathFragmentSchema>;
export type RelativePath = z.output<typeof RelativePathSchema>;
