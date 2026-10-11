// Context - workaround to avoid use of `z.output` to avoid circular dependencies

import type { z } from "zod";

export type AbsolutePathLiteral = "AbsolutePath";
export type AbsolutePath = string & z.$brand<AbsolutePathLiteral>;

export type RelativePathLiteral = "RelativePath";
export type RelativePath = string & z.$brand<RelativePathLiteral>;

export type PathFragmentLiteral = "PathFragment";
export type PathFragment = RelativePath & z.$brand<PathFragmentLiteral>;
