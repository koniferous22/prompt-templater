import { match } from "ts-pattern";

import { pathFragmentVariant } from "../../../constants/runtime/pathFragmentVariant.js";

export const { AbsolutePathSchema, PathFragmentSchema, RelativePathSchema } = await match(
  pathFragmentVariant,
)
  .with("posix", async () => {
    const { AbsolutePathSchema, PathFragmentSchema, RelativePathSchema } =
      await import("./platformSpecific/posix/path.js");
    return {
      AbsolutePathSchema,
      PathFragmentSchema,
      RelativePathSchema,
    };
  })
  .with("win32", async () => {
    const { AbsolutePathSchema, PathFragmentSchema, RelativePathSchema } =
      await import("./platformSpecific/win32/path.js");
    return {
      AbsolutePathSchema,
      PathFragmentSchema,
      RelativePathSchema,
    };
  })
  .exhaustive();

export type { AbsolutePath, RelativePath, PathFragment } from "./typeBrands/path.js";
