import path from "path";

import {
  AbsolutePathWin32Schema,
  type AbsolutePathWin32,
} from "../../../../validation/path/customTypes/platformSpecific/win32/path.js";

export function longestCommonPathPrefixWin32(
  a: AbsolutePathWin32,
  b: AbsolutePathWin32,
): AbsolutePathWin32 | null {
  const normA = path.win32.normalize(a);
  const normB = path.win32.normalize(b);

  const rootA = path.win32.parse(normA).root;
  const rootB = path.win32.parse(normB).root;

  // Drive letters are case-insensitive
  if (rootA.toLowerCase() !== rootB.toLowerCase()) {
    return null;
  }

  const segmentsA = normA.slice(rootA.length).split("\\").filter(Boolean);
  const segmentsB = normB.slice(rootB.length).split("\\").filter(Boolean);

  const common: string[] = [];
  const len = Math.min(segmentsA.length, segmentsB.length);

  for (let i = 0; i < len; i++) {
    // case-insensitive comparison
    if (segmentsA[i]!.toLowerCase() !== segmentsB[i]!.toLowerCase()) {
      break;
    }
    common.push(segmentsA[i]!);
  }

  if (common.length === 0) {
    return AbsolutePathWin32Schema.parse(rootA);
  }

  return AbsolutePathWin32Schema.parse(rootA + common.join("\\"));
}
