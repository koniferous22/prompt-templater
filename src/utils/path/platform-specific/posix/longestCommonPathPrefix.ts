import path from "node:path";

import {
  AbsolutePathPosixSchema,
  type AbsolutePathPosix,
} from "../../../../validation/customTypes/platform-specific/posix/path.js";

export function longestCommonPathPrefixPosix(
  a: AbsolutePathPosix,
  b: AbsolutePathPosix,
): AbsolutePathPosix | null {
  const normA = path.posix.normalize(a);
  const normB = path.posix.normalize(b);

  const rootA = path.posix.parse(normA).root;
  const rootB = path.posix.parse(normB).root;

  if (rootA !== rootB) {
    return null;
  }

  const segmentsA = normA.slice(rootA.length).split("/").filter(Boolean);
  const segmentsB = normB.slice(rootB.length).split("/").filter(Boolean);

  const common: string[] = [];
  const len = Math.min(segmentsA.length, segmentsB.length);

  for (let i = 0; i < len; i++) {
    if (segmentsA[i] !== segmentsB[i]) {
      break;
    }
    common.push(segmentsA[i]!);
  }

  if (common.length === 0) {
    return AbsolutePathPosixSchema.parse(rootA);
  }

  return AbsolutePathPosixSchema.parse(rootA + common.join("/"));
}
