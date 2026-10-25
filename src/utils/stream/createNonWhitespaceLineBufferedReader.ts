import { createInterface } from "node:readline";
import type { Readable } from "node:stream";

export function createNonWhitespaceLineBufferedReader(stream: Readable) {
  const rl = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  return {
    async *[Symbol.asyncIterator]() {
      let whitespaceLines: string[] = [];

      try {
        for await (const line of rl) {
          if (line.trim() === "") {
            whitespaceLines.push(line);
          } else {
            yield {
              type: "line" as const,
              whitespaceLines,
              line,
            };
            whitespaceLines = [];
          }
        }
        // EOF – emit any remaining empty lines
        yield {
          type: "eof" as const,
          trailingWhitespaceLines: whitespaceLines,
        };
      } finally {
        rl.close();
        // Ensure the underlying stream is destroyed as well
        // (safe even if the stream has already ended)
        if (!stream.destroyed && typeof stream.destroy === "function") {
          stream.destroy();
        }
      }
    },
  };
}
