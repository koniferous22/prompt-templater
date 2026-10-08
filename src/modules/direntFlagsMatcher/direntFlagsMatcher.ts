import type { Dirent } from "node:fs";
import type z from "zod";
import { AbsolutePathSchema, PathFragmentSchema, type AbsolutePath, type PathFragment } from "../../validation/customTypes/path.js";
import type { DirentSchema } from "../../validation/pipes/dirent.js";
import { appErr, createError, type AppErrorInstance } from "../../utils/deps/neverthrow/errorFactory.js";
import { ok } from "neverthrow";
import { errFromZodError } from "../../utils/deps/neverthrow/resultFromSafeParseResult.js";
import { isNonEmptyArray } from "../../utils/array/isNonEmptyArray.js";
import { resultFromErrorList } from "../../utils/deps/neverthrow/resultFromErrorList.js";
import { getOrInsert } from "../../utils/map/getOrInsert.js";

export type DirentFlags = z.output<typeof DirentSchema>['direntFlags'];
type DirentFlag = keyof DirentFlags

type DirentFlagPattern =
  | boolean
  | 'any'

export type DirentFlagPatterns = Record<DirentFlag, DirentFlagPattern>;

const formatUnmatchedDirentFlagError = (error: { direntFlag: DirentFlag; expected: boolean; actual: boolean }, ctx: { path: AbsolutePath }) => createError('module_direntFlagsMatcher_unmatchedDirentFlag', { ...ctx, ...error });

export const validateDirentFlags = (expectedFlagPatterns: DirentFlagPatterns, direntFlags: DirentFlags, ctx: { path: AbsolutePath; }) => {
  const direntFlagsTypes = [
    'isDirectory',
    'isFile',
    'isSymlink'
  ] satisfies DirentFlag[];
  const errors: ReturnType<typeof formatUnmatchedDirentFlagError>[] = [];
  for (const direntFlagType of direntFlagsTypes) {
    const expectedDirentFlag = expectedFlagPatterns[direntFlagType];
    if (expectedDirentFlag === 'any') {
      continue;
    }
    if (expectedDirentFlag !== direntFlags[direntFlagType]) {
      errors.push(formatUnmatchedDirentFlagError(
        {
          direntFlag: direntFlagType,
          expected: expectedDirentFlag,
          actual: direntFlags[direntFlagType],
        },
        ctx,
      ));
    }
  }
  return isNonEmptyArray(errors) ?
    errors :
    null;
};


// Map construction
const createDirentFlagsMap = (inputDirents: Dirent<string>[]) => {
  const result = new Map<AbsolutePath, Map<PathFragment, DirentFlags>>();
  for (const dirent of inputDirents) {
    const parentPathResult = AbsolutePathSchema.safeParse(dirent.parentPath);
    if (!parentPathResult.success) {
      // TODO actual exception
      return errFromZodError(parentPathResult.error);
    }
    const dirEntryNameResult = PathFragmentSchema.safeParse(dirent.name);
    if (!dirEntryNameResult.success) {
      // TODO actual exception
      return errFromZodError(dirEntryNameResult.error);
    }
    const folderEntryMap = getOrInsert(result, parentPathResult.data, new Map<PathFragment, DirentFlags>());
    folderEntryMap.set(dirEntryNameResult.data, {
      isDirectory: dirent.isDirectory(),
      isFile: dirent.isFile(),
      isSymlink: dirent.isSymbolicLink(),
    });
  }
  return ok(result);
};

export const createDirentFlagsMatcher = (
  folderPath: AbsolutePath,
  patterns: Map<PathFragment,DirentFlagPatterns>,
  options: {
    failOnExtraItems: boolean;
  } = {
    failOnExtraItems: false,
  },
) => (inputDirents: Dirent<string>[]) => {
  const direntsMatchingAbsPath = inputDirents.filter((dirent) => dirent.parentPath === folderPath);
  const direntsExtra = inputDirents.filter((dirent) => dirent.parentPath !== folderPath).map((dirent) => dirent.name);
  if (options.failOnExtraItems && isNonEmptyArray(direntsExtra)) {
    return appErr('module_direntFlagsMatcher_extraItemsFromWrongFolderFound', {
      expectedFolderPath: folderPath,
      extraItems: direntsExtra,
    })
  }
  const direntFlagsMapResult = createDirentFlagsMap(direntsMatchingAbsPath)
  if (!direntFlagsMapResult.isOk()) {
    return appErr('module_direntFlagsMatcher_createDirentFlagsMapFailed', undefined, {
      cause: direntFlagsMapResult.error,
    });
  }
  const direntFlagsMap = direntFlagsMapResult.value.get(folderPath);
  if (direntFlagsMap === undefined) {
    return patterns.size > 0 ?
      ok(undefined) :
      appErr('module_direntFlagsMatcher_noFolderContentsFound', {
        expectedFolderPath: folderPath,
      });
  }
  const errors: AppErrorInstance[] = []
  const direntsWithFlagsToCheck = new Map<PathFragment, { expected: DirentFlagPatterns; actual: DirentFlags }>();
  // Check here if all patterns appear in the map
  for (const [pattern, expectedFlags] of patterns) {
    const actualFlags = direntFlagsMap.get(pattern);
    // Pattern not found in folder
    if (actualFlags === undefined) {
      errors.push(createError('module_direntFlagsMatcher_patternNotFound', {
        parentPath: folderPath,
        pattern,
      }));
    } else {
      direntsWithFlagsToCheck.set(pattern, {
        expected: expectedFlags,
        actual: actualFlags,
      });
    }
  }
  // If directory is supposed to be exact match, check vice versa - i.e. if FS folder contains no other items aside from those specified in pattern
  if (options.failOnExtraItems) {
    const extraItems = direntFlagsMap.keys().filter((direntryFileName) => !patterns.has(direntryFileName)).toArray();
    if (isNonEmptyArray(extraItems)) {
      errors.push(createError('module_direntFlagsMatcher_extraItemsFound', {
        expectedFolderPath: folderPath,
        extraItems,
      }))
    }
  }
  for (const [, { expected, actual }] of direntsWithFlagsToCheck) {
    const validateDirentFlagsResult = validateDirentFlags(expected, actual, { path: folderPath });
    if (validateDirentFlagsResult !== null) {
      errors.push(...validateDirentFlagsResult);
    }
  }

  return resultFromErrorList(...errors);
};
