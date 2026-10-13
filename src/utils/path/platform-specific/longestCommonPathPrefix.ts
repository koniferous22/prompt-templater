import { match } from "ts-pattern";

import type { AbsolutePath } from "../../../validation/customTypes/path.js";
import { pathFragmentVariant } from "../../platform/detectPlatformFeatures.js";

export const longestCommonPathPrefix = await match(pathFragmentVariant)
  .with("posix", async () => {
    const { longestCommonPathPrefixPosix } = await import("./posix/longestCommonPathPrefix.js");
    return longestCommonPathPrefixPosix as any as (
      path1: AbsolutePath,
      path2: AbsolutePath,
    ) => AbsolutePath | null;
  })
  .with("win32", async () => {
    const { longestCommonPathPrefixWin32 } = await import("./win32/longestCommonPathPrefix.js");
    return longestCommonPathPrefixWin32 as any as (
      path1: AbsolutePath,
      path2: AbsolutePath,
    ) => AbsolutePath | null;
  })
  .exhaustive();
