import fs from "node:fs";

import { err, ok } from "neverthrow";
import { match } from "ts-pattern";
import type z from "zod";

import { createError } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { appErrAsyncFromThrowable } from "../../../../utils/deps/neverthrow/errorFromThrowable.js";
import { errorFromOptionalErrorList } from "../../../../utils/deps/neverthrow/optionalErrorList.js";
import type { AppError } from "../../../../utils/deps/neverthrow/types.js";
import type { AwaitedFromGenerator } from "../../../../utils/generics/awaitedFromGenerator.js";
import { createNonWhitespaceLineBufferedReader } from "../../../../utils/stream/createNonWhitespaceLineBufferedReader.js";
import type { File } from "../../../../validation/fs/schemas/file.js";
import type { PlainFileTermReferenceOptionsSchema } from "../../../../validation/resourceReference/term/schemas/plainFileReferenceOptions.js";

type NonEmptyLineChunk = AwaitedFromGenerator<
  ReturnType<ReturnType<typeof createNonWhitespaceLineBufferedReader>[typeof Symbol.asyncIterator]>
>;

type ParserErrorType =
  | AppError<"dependency_nodeFs_fsReadDir_invalidOuptutShape">
  | AppError<"module_resources_term_plaintextTermFileParser_parsedWhitespaceLines">;

const createProcessingCallbackFromOptions = (
  options: Pick<
    z.output<typeof PlainFileTermReferenceOptionsSchema>,
    "trimWhitespace" | "whitespaceLines"
  >,
): ((
  nonEmptyLineChunk: NonEmptyLineChunk,
  context: { lastParsedLine: number; filepath: File },
) => {
  lines: string[];
  errors?: ParserErrorType[] | undefined;
}) => {
  return match(options)
    .with({ trimWhitespace: true, whitespaceLines: "allow" }, () => (chunk: NonEmptyLineChunk) => {
      if (chunk.type === "eof") {
        return {
          lines: chunk.trailingWhitespaceLines.map((whitespaceLine) => whitespaceLine.trim()),
        };
      }
      return {
        lines: chunk.whitespaceLines.concat(chunk.line).map((line) => line.trim()),
      };
    })
    .with({ trimWhitespace: true, whitespaceLines: "skip" }, () => (chunk: NonEmptyLineChunk) => {
      if (chunk.type === "eof") {
        return {
          lines: [],
        };
      }
      const currentLine = chunk.line.trim();
      return currentLine === ""
        ? {
            lines: [],
          }
        : {
            lines: [currentLine],
          };
    })
    .with(
      { trimWhitespace: true, whitespaceLines: "skipTrailing" },
      () => (chunk: NonEmptyLineChunk, context: { lastParsedLine: number; filepath: File }) => {
        if (chunk.type === "eof") {
          // Remove all encountered trailing whitespace lines - i.e. automatically trimmed
          return {
            lines: [],
          };
        }
        const errors: ParserErrorType[] = [];
        if (chunk.whitespaceLines.length > 0) {
          errors.push(
            createError("module_resources_term_plaintextTermFileParser_parsedWhitespaceLines", {
              startingLineNumber: context.lastParsedLine + 1,
              lines: chunk.whitespaceLines,
              filepath: context.filepath,
            }),
          );
        }
        const currentLine = chunk.line.trim();
        return {
          lines: [currentLine],
          errors,
        };
      },
    )
    .with(
      { trimWhitespace: true, whitespaceLines: "fail" },
      () => (chunk: NonEmptyLineChunk, context: { lastParsedLine: number; filepath: File }) => {
        if (chunk.type === "eof") {
          return {
            lines: [],
            errors:
              chunk.trailingWhitespaceLines.length > 0
                ? [
                    createError(
                      "module_resources_term_plaintextTermFileParser_parsedWhitespaceLines",
                      {
                        startingLineNumber: context.lastParsedLine + 1,
                        lines: chunk.trailingWhitespaceLines,
                        filepath: context.filepath,
                      },
                    ),
                  ]
                : [],
          };
        }
        const errors: ParserErrorType[] = [];
        if (chunk.whitespaceLines.length > 0) {
          errors.push(
            createError("module_resources_term_plaintextTermFileParser_parsedWhitespaceLines", {
              startingLineNumber: context.lastParsedLine + 1,
              lines: chunk.whitespaceLines,
              filepath: context.filepath,
            }),
          );
        }
        const currentLine = chunk.line.trim();
        return {
          lines: [currentLine],
          errors,
        };
      },
    )
    .with({ trimWhitespace: false, whitespaceLines: "allow" }, () => (chunk: NonEmptyLineChunk) => {
      if (chunk.type === "eof") {
        return {
          lines: chunk.trailingWhitespaceLines,
        };
      }
      return {
        lines: chunk.whitespaceLines.concat(chunk.line),
      };
    })
    .with({ trimWhitespace: false, whitespaceLines: "skip" }, () => (chunk: NonEmptyLineChunk) => {
      if (chunk.type === "eof") {
        const lastNonEmptyLineIndex = chunk.trailingWhitespaceLines.findLastIndex(
          (trailingWhiteSpaceLine) => trailingWhiteSpaceLine !== "",
        );
        if (lastNonEmptyLineIndex < 0) {
          // if all lines of array are empty string then consider them all to be trailing empty lines
          return {
            lines: [],
          };
        }
        return {
          // Note - take prefix of array, such that rest are trailing lines (i.e. empty strings)
          lines: chunk.trailingWhitespaceLines.slice(0, lastNonEmptyLineIndex + 1),
        };
      }
      // Skip empty parsed lines
      const whitespaceLines = chunk.whitespaceLines.filter(
        (whitespaceLine) => whitespaceLine !== "",
      );
      const currentLine = chunk.line;
      return currentLine === ""
        ? {
            lines: whitespaceLines,
          }
        : {
            lines: whitespaceLines.concat(currentLine),
          };
    })
    .with(
      { trimWhitespace: false, whitespaceLines: "skipTrailing" },
      () => (chunk: NonEmptyLineChunk, context: { lastParsedLine: number; filepath: File }) => {
        if (chunk.type === "eof") {
          const lastNonEmptyLineIndex = chunk.trailingWhitespaceLines.findLastIndex(
            (trailingWhiteSpaceLine) => trailingWhiteSpaceLine !== "",
          );
          if (lastNonEmptyLineIndex < 0) {
            // if all lines of array are empty string then consider them all to be trailing empty lines
            return {
              lines: [],
            };
          }
          // Potential bug - when not trimmed lines that contain only whitespaces can be treated as values, however they should potentially be treated as errors
          return {
            // Note - take prefix of array, such that rest are trailing lines (i.e. empty strings)
            lines: chunk.trailingWhitespaceLines.slice(0, lastNonEmptyLineIndex + 1),
          };
        }
        const errors: ParserErrorType[] = [];
        if (chunk.whitespaceLines.length > 0) {
          errors.push(
            createError("module_resources_term_plaintextTermFileParser_parsedWhitespaceLines", {
              startingLineNumber: context.lastParsedLine + 1,
              lines: chunk.whitespaceLines,
              filepath: context.filepath,
            }),
          );
        }
        const currentLine = chunk.line;
        return {
          lines: [currentLine],
          errors,
        };
      },
    )
    .with(
      { trimWhitespace: false, whitespaceLines: "fail" },
      () => (chunk: NonEmptyLineChunk, context: { lastParsedLine: number; filepath: File }) => {
        if (chunk.type === "eof") {
          return {
            lines: [],
            errors:
              chunk.trailingWhitespaceLines.length > 0
                ? [
                    createError(
                      "module_resources_term_plaintextTermFileParser_parsedWhitespaceLines",
                      {
                        startingLineNumber: context.lastParsedLine + 1,
                        lines: chunk.trailingWhitespaceLines,
                        filepath: context.filepath,
                      },
                    ),
                  ]
                : [],
          };
        }
        const errors: ParserErrorType[] = [];
        if (chunk.whitespaceLines.length > 0) {
          errors.push(
            createError("module_resources_term_plaintextTermFileParser_parsedWhitespaceLines", {
              startingLineNumber: context.lastParsedLine + 1,
              lines: chunk.whitespaceLines,
              filepath: context.filepath,
            }),
          );
        }
        const currentLine = chunk.line;
        return {
          lines: [currentLine],
          errors,
        };
      },
    )
    .exhaustive();
};

const readPlaintextFileLines = appErrAsyncFromThrowable(
  async (
    file: File,
    lineCallback: ReturnType<typeof createProcessingCallbackFromOptions>,
    options: { strict: boolean },
  ) => {
    const lines: string[] = [];
    // TODO - narrow down potential list of errors types
    const parserErrors: ParserErrorType[] = [];
    const fileStream: fs.ReadStream = fs.createReadStream(file);
    const nonEmptyLineReader = createNonWhitespaceLineBufferedReader(fileStream);

    let lineCounter = 0;
    for await (const nonEmptyLineBuffer of nonEmptyLineReader) {
      const result = lineCallback(nonEmptyLineBuffer, {
        lastParsedLine: lineCounter,
        filepath: file,
      });
      if (result.errors !== undefined && result.errors.length > 0) {
        parserErrors.push(...result.errors);
        if (options.strict) {
          // Fail asap if strict mode has been set
          return {
            lines,
            errors: parserErrors,
          };
        }
      }
      const parsedLineCount =
        nonEmptyLineBuffer.type === "eof"
          ? nonEmptyLineBuffer.trailingWhitespaceLines.length
          : nonEmptyLineBuffer.whitespaceLines.length + 1;
      lineCounter += parsedLineCount;
      // Push the line regardless of result
      lines.push(...result.lines);
    }
    return {
      lines,
      // Note returning errors in plain object to avoid nesting inner Result within Result
      errors: parserErrors,
    };
  },
  (error: unknown, file: File) => {
    return createError(
      "dependency_nodeFs_fsCreateReadStream_unableToOpenForReading",
      {
        value: file,
        errorMessage: (error as Error).message,
      },
      {
        cause: error,
      },
    );
  },
);

export const plaintextTermFileParser = async (
  inputFile: File,
  options: z.output<typeof PlainFileTermReferenceOptionsSchema>,
) => {
  const linesResult = await readPlaintextFileLines(
    inputFile,
    createProcessingCallbackFromOptions(options),
    options,
  );
  if (!linesResult.isOk()) {
    return linesResult;
  }
  const { lines, errors } = linesResult.value;
  const [firstError, ...rest] = errors;
  const parserResult = errorFromOptionalErrorList(firstError, ...rest);
  return parserResult === null ? ok(lines) : err(parserResult);
};
