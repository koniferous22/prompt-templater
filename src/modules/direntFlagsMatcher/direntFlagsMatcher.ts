import type z from "zod";
import { AbsolutePathSchema, PathFragmentSchema, type AbsolutePath, type PathFragment, type RelativePath } from "../../validation/customTypes/path.js";
import type { DirentData } from "../../validation/pipes/dirent.js";
import { appErr, createError, type AppErrorInstance } from "../../utils/deps/neverthrow/errorFactory.js";
import { ok } from "neverthrow";
import { errFromZodError } from "../../utils/deps/neverthrow/resultFromSafeParseResult.js";
import { isNonEmptyArray } from "../../utils/array/isNonEmptyArray.js";
import { resultFromErrorList } from "../../utils/deps/neverthrow/resultFromErrorList.js";
import { getOrInsert } from "../../utils/map/getOrInsert.js";
import { join } from "node:path";

export type DirentFlags = DirentData['direntFlags'];
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
const createDirentFlagsMap = (inputDirents: DirentData[]) => {
  const flagsMap = new Map<AbsolutePath, Map<PathFragment, DirentFlags>>();
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
    const folderEntryMap = getOrInsert(flagsMap, parentPathResult.data, new Map<PathFragment, DirentFlags>());
    folderEntryMap.set(dirEntryNameResult.data, dirent.direntFlags);
  }
  const result = {
    getData: () => flagsMap,
    toDirentFlagsByAbsolutePath: () => new Map<AbsolutePath, DirentFlags>(
      flagsMap
        .entries()
        .flatMap(([ parentPath, entryFlagsMap ]) => entryFlagsMap
          .entries()
          .map(([ dirEntry, flags ]) => [ AbsolutePathSchema.parse(join(parentPath, dirEntry)), flags ])
        )
    )
  };
  return ok(result);
};

export const createDirentFlagsMatcher = (
  folderPath: AbsolutePath,
  patterns: Map<RelativePath,DirentFlagPatterns>,
  options: {
    failOnExtraItems: boolean;
  } = {
    failOnExtraItems: false,
  },
) => (inputDirents: DirentData[]) => {
  const direntsMatchingAbsPath = inputDirents.filter((dirent) => dirent.parentPath.startsWith(folderPath));
  const direntsExtra = inputDirents.filter((dirent) => !dirent.parentPath.startsWith(folderPath)).map((dirent) => dirent.name);
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
  const direntFlagsByAbsolutePathMap = direntFlagsMapResult.value.toDirentFlagsByAbsolutePath();
  const patternsByAbsolutePathMap = new Map<AbsolutePath, { flags: DirentFlagPatterns; originalPattern: RelativePath }>(
    patterns.entries()
      .map(([pattern, flags]) => [
        AbsolutePathSchema.parse(join(folderPath, pattern)),
        { flags, originalPattern: pattern },
      ])
  );
  const allAbsolutePaths = new Set<AbsolutePath>([
    ...patternsByAbsolutePathMap.keys(),
    ...direntFlagsByAbsolutePathMap.keys()
  ]);
  const comparisonMap = new Map<
    AbsolutePath,
    | { pattern: { flags: DirentFlagPatterns; originalPattern: RelativePath }; direntFlags: DirentFlags | null } 
    | { pattern: { flags: DirentFlagPatterns; originalPattern: RelativePath } | null; direntFlags: DirentFlags }
  >(
    Array.from(allAbsolutePaths).map((absolutePath) => {
      const patternByAbsPath = patternsByAbsolutePathMap.get(absolutePath)
      return patternByAbsPath !== undefined ?
        [
          absolutePath,
          {
            pattern: patternByAbsPath,
            direntFlags: direntFlagsByAbsolutePathMap.get(absolutePath) ?? null,
          }
        ] :
        [
          absolutePath,
          {
            pattern: patternsByAbsolutePathMap.get(absolutePath) ?? null,
            // TS - otherwise the path has to be present in another map
            direntFlags: direntFlagsByAbsolutePathMap.get(absolutePath)!,
          }
        ];
    })
  );
  const errors: AppErrorInstance[] = []
  // If directory is supposed to be exact match, check vice versa - i.e. if FS folder contains no other items aside from those specified in pattern
  if (options.failOnExtraItems) {
    for (const [absolutePath, { pattern, direntFlags }] of comparisonMap) {
      // Pattern not found in folder
      if (pattern !== null && direntFlags === null) {
        errors.push(createError('module_direntFlagsMatcher_patternNotFound', {
          parentPath: folderPath,
          pattern: pattern.originalPattern,
        }));
        continue;
      }
      if (pattern === null && direntFlags !== null) {
        errors.push(createError('module_direntFlagsMatcher_extraItemsFound', {
          expectedFolderPath: folderPath,
          extraItem: absolutePath,
        }))
        continue;
      }
      if (pattern !== null && direntFlags !== null) {
        const validateDirentFlagsResult = validateDirentFlags(pattern?.flags, direntFlags, { path: folderPath });
        if (validateDirentFlagsResult !== null) {
          errors.push(...validateDirentFlagsResult);
        }
      }
    }

  } else {
    for (const [, { pattern, direntFlags }] of comparisonMap) {
      // Pattern not found in folder
      if (pattern !== null && direntFlags === null) {
        errors.push(createError('module_direntFlagsMatcher_patternNotFound', {
          parentPath: folderPath,
          pattern: pattern.originalPattern,
        }));
        continue;
      }
      if (pattern !== null && direntFlags !== null) {
        const validateDirentFlagsResult = validateDirentFlags(pattern?.flags, direntFlags, { path: folderPath });
        if (validateDirentFlagsResult !== null) {
          errors.push(...validateDirentFlagsResult);
        }
      }
    }
  }

  return resultFromErrorList(...errors);
};
