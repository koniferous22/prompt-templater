import { pathFragmentVariant } from "../../utils/node/detectPlatformFeatures.js";
import { match } from "ts-pattern";
import type z from "zod";

export const {
  PathFragmentSchema
} = await match(pathFragmentVariant)
  .with('posix', async () => {
    const {
      PathFragmentPosixSchema,
    } = await import('./platform-specific/posix/pathFragment.js');
    return {
      PathFragmentSchema: PathFragmentPosixSchema
    };
  })
  .with('win32', async () => {
    const {
      PathFragmentWin32Schema,
    } = await import('./platform-specific/win32/pathFragment.js');
    return {
      PathFragmentSchema: PathFragmentWin32Schema,
    };
  })
  .exhaustive();
export type PathFragment = z.output<typeof PathFragmentSchema>;
