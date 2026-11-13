import { describe, expect, spyOn, afterEach, it } from "bun:test";

import { ok, Result } from "neverthrow";

import type { AppErrorCode } from "../../constants/errorCodes.js";
import { appErr } from "../deps/neverthrow/errorFactory.js";
import type { AppAggregateErr, AppError } from "../deps/neverthrow/types.js";
import { handleCliError } from "./cliErrorHandler.js";

const testCasesForCliErrorHandler = [
  {
    testInput: {
      data: async () => ok(42),
      testCaseDescription: "callback returning ok result",
    },
    testOutcome: {
      data: {
        shouldExpectConsoleErrorCall: false,
        exitCode: 0,
      },
      testBehaviourDescription: "do nothing on ok(42) result",
    },
  },
  {
    testInput: {
      data: async () => appErr("dependency_nodeFs_fsReadDir_invalidOuptutShape", undefined),
      testCaseDescription: "callback returning err result",
    },
    testOutcome: {
      data: {
        shouldExpectConsoleErrorCall: true,
        exitCode: 1,
      },
      testBehaviourDescription: "do nothing on ok(42) result",
    },
  },
] satisfies {
  testInput: {
    data: () => Promise<Result<any, AppAggregateErr | AppError<AppErrorCode>>>;
    testCaseDescription: string;
  };
  testOutcome: {
    data: {
      shouldExpectConsoleErrorCall: boolean;
      exitCode: number;
    };
    testBehaviourDescription: string;
  };
}[];

describe("handleCliError", () => {
  let originalExitCode: typeof process.exitCode;
  afterEach(() => {
    // Critical: prevent contaminating bun test’s exit code
    process.exitCode = originalExitCode;
  });

  for (const { testInput, testOutcome } of testCasesForCliErrorHandler) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, async () => {
      originalExitCode = process.exitCode;
      process.exitCode = 0;
      const consoleError = spyOn(console, "error").mockImplementation(() => {});
      const run = handleCliError(testInput.data);
      await run();
      if (testOutcome.data.shouldExpectConsoleErrorCall) {
        expect(consoleError).toHaveBeenCalled();
      } else {
        expect(consoleError).not.toHaveBeenCalled();
      }
      expect(process.exitCode).toBe(testOutcome.data.exitCode);

      consoleError.mockRestore();
    });
  }
});
