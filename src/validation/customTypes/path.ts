import { pathFragmentVariant } from "../../utils/node/detectPlatformFeatures.js";
import { match } from "ts-pattern";

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
  
export type {
  AbsolutePath,
  RelativePath,
  PathFragment,
} from './type-brands/path.js';
