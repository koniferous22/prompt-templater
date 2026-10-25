import { expectTypeOf } from "expect-type";

import type { createNonWhitespaceLineBufferedReader } from "../stream/createNonWhitespaceLineBufferedReader.js";
import type { AwaitedFromGenerator } from "./awaitedFromGenerator.js";

expectTypeOf<
  AwaitedFromGenerator<
    ReturnType<
      ReturnType<typeof createNonWhitespaceLineBufferedReader>[typeof Symbol.asyncIterator]
    >
  >
>(null as any).toEqualTypeOf<
  | {
      type: "line";
      whitespaceLines: string[];
      line: string;
      trailingWhitespaceLines?: never;
    }
  | {
      type: "eof";
      trailingWhitespaceLines: string[];
      whitespaceLines?: never;
      line?: never;
    }
>();
