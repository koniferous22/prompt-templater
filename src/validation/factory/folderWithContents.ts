import fs from "node:fs/promises";
import { join } from "node:path";

import { ok, err, Result } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import {
  createDirentFlagsMatcher,
  type DirentFlagPatterns,
} from "../../modules/direntFlagsMatcher/direntFlagsMatcher.js";
import { isNonEmptyArray } from "../../utils/array/isNonEmptyArray.js";
import { appErr } from "../../utils/deps/neverthrow/errorFactory.js";
import { resultFromErrorList } from "../../utils/deps/neverthrow/errorList.js";
import { zodIssueFromAppError } from "../../utils/deps/zod/zodIssueFromAppError.js";
import { AbsolutePathToFsStatsSchema } from "../codecs/absolutePathToFsStats.js";
import type { AbsolutePath, PathFragment, RelativePath } from "../customTypes/path.js";
import { DirentSchema } from "../pipes/dirent.js";
import { FolderSchema } from "../schemas/fs/folder.js";

type CreateFolderWithContentsSchemaOpts =
  | {
      pathDetection: "checkStaticEntries";
      items: Map<PathFragment, DirentFlagPatterns>;
    }
  | {
      pathDetection: "readDir";
      items: Map<PathFragment, DirentFlagPatterns>;
      failOnExtraItems: boolean;
    }
  | {
      pathDetection: "readDirRecursive";
      items: Map<RelativePath, DirentFlagPatterns>;
      failOnExtraItems: boolean;
    };

const pathDetectionReadDir = async (
  parentFolder: AbsolutePath,
  { recursive }: { recursive: boolean } = { recursive: false },
) => {
  try {
    const files = await fs.readdir(parentFolder, { withFileTypes: true, recursive });
    const folderContentsResult = z.array(DirentSchema).safeParse(files);
    if (!folderContentsResult.success) {
      return appErr("dependency_nodeFs_fsReadDirInvalidOuptutShape", undefined);
    }
    return ok(folderContentsResult.data);
  } catch (error: any) {
    return appErr("dependency_nodeFs_fsReadDirOperationFailed", {
      rootFolder: parentFolder,
      errorMessage: error.message,
    });
  }
};

const pathDetectionCheckStaticEntries = async (
  parentFolder: AbsolutePath,
  listedEntries: RelativePath[],
) => {
  const fsStatsResults = await Promise.allSettled(
    listedEntries.map(async (listedEntry) => ({
      entry: listedEntry,
      statsResult: await AbsolutePathToFsStatsSchema.safeDecodeAsync(
        join(parentFolder, listedEntry),
      ),
    })),
  );
  const results = fsStatsResults.map((promiseResult) => {
    const statsResult = match(promiseResult)
      .with({ status: "fulfilled" }, ({ value }) =>
        match(value.statsResult)
          .with({ success: true }, (result) =>
            ok({
              stats: result.data,
              entry: value.entry,
            }),
          )
          .with({ success: false }, (result) =>
            appErr("validation_codec_absolutePathToFsStats_invalidInputData", {
              zodError: result.error,
            }),
          )
          .exhaustive(),
      )
      .with({ status: "rejected" }, () => appErr("dependency_zod_awaitingAsyncDecode", {}))
      .exhaustive();
    return statsResult.isErr()
      ? err(statsResult.error)
      : ok({
          parentPath: parentFolder,
          name: statsResult.value.entry,
          direntFlags: {
            isDirectory: statsResult.value.stats.fsStats.isDirectory(),
            isFile: statsResult.value.stats.fsStats.isFile(),
            isSymlink: statsResult.value.stats.fsStats.isSymbolicLink(),
          },
        } satisfies z.output<typeof DirentSchema>);
  });
  const errors = results.filter((result) => result.isErr());
  if (isNonEmptyArray(errors)) {
    return resultFromErrorList(...errors);
  }
  const okValues = results.filter((result) => result.isOk());
  return Result.combine(okValues);
};

const createAbsolutePathValidationCallbackFromOptions = (
  options: CreateFolderWithContentsSchemaOpts,
) => {
  return match(options)
    .with(
      { pathDetection: "readDir" },
      ({ items, failOnExtraItems }) =>
        async (absPath: AbsolutePath) => {
          const direntMatcher = createDirentFlagsMatcher(absPath, items, { failOnExtraItems });
          const fsPathsResult = await pathDetectionReadDir(absPath);
          if (!fsPathsResult.isOk()) {
            return fsPathsResult;
          }
          return direntMatcher(fsPathsResult.value);
        },
    )
    .with(
      { pathDetection: "readDirRecursive" },
      ({ items, failOnExtraItems }) =>
        async (absPath: AbsolutePath) => {
          const direntMatcher = createDirentFlagsMatcher(absPath, items, { failOnExtraItems });
          const fsPathsResult = await pathDetectionReadDir(absPath, { recursive: true });
          if (!fsPathsResult.isOk()) {
            return fsPathsResult;
          }
          return direntMatcher(fsPathsResult.value);
        },
    )
    .with({ pathDetection: "checkStaticEntries" }, ({ items }) => async (absPath: AbsolutePath) => {
      // Note - `failOnExtraItems` unapplicable here, because whitelist is passed
      const direntMatcher = createDirentFlagsMatcher(absPath, items, { failOnExtraItems: false });
      const fsPathsResult = await pathDetectionCheckStaticEntries(
        absPath,
        Array.from(items.keys()),
      );
      if (!fsPathsResult.isOk()) {
        return fsPathsResult;
      }
      return direntMatcher(fsPathsResult.value);
    })
    .exhaustive();
};

export const createFolderWithContentsSchema = (opts: CreateFolderWithContentsSchemaOpts) => {
  const absolutePathValidationCallback = createAbsolutePathValidationCallbackFromOptions(opts);
  return FolderSchema.check(async (ctx) => {
    const value = ctx.value;
    const result = await absolutePathValidationCallback(value);
    if (result.isErr()) {
      const errorFromCallback = result.error;
      if (errorFromCallback.type === "plain") {
        ctx.issues.push(zodIssueFromAppError(errorFromCallback, ctx.value));
      } else {
        for (const nestedError of errorFromCallback.errors) {
          ctx.issues.push(zodIssueFromAppError(nestedError, ctx.value));
        }
      }
    }
  }).brand<"FolderWithContents">();
};
