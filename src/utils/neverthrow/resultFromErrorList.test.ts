import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createError, type AppError } from './errorFactory.js';
import type { AppErrorCode } from '../../constants/errorCodes.js';
import { resultFromHomogeneousErrorList } from './resultFromErrorList.js';

const errorStandalone1 = createError('cliArgsProcessing_emptyStringAsArgument', undefined);

const testCasesForResultFromHomogeneousErrorList = [
  {
    testInput: {
      data: [] as AppError<AppErrorCode>[],
      testCaseDescription: 'input consisting of no errors',
    },
    testOutcome: {
      data: {
        ok: true,
        value: undefined,
      },
      testBehaviourDescription: 'return ok(undefined)',
    }
  },
  {
    testInput: {
      data: [
        errorStandalone1,
      ] as AppError<AppErrorCode>[],
      testCaseDescription: 'input consisting of single error',
    },
    testOutcome: {
      data: {
        ok: false,
        errors: errorStandalone1,
      },
      testBehaviourDescription: 'return \'err\' with single app error',
    }
  },
  {
    testInput: {
      data: [
        errorStandalone1,
        errorStandalone1,
      ] as AppError<AppErrorCode>[],
      testCaseDescription: 'input consisting of multiple errors',
    },
    testOutcome: {
      data: {
        ok: false,
        errors: [
          errorStandalone1,
          errorStandalone1,
        ],
      },
      testBehaviourDescription: 'return \'err\' with aggregated error of multiple app errors',
    }
  },
] satisfies {
  testInput: {
    data: AppError<AppErrorCode>[];
    testCaseDescription: string
  };
  testOutcome: {
    data: { ok: true, value: undefined } | { ok: false; errors: AppError<AppErrorCode> | AppError<AppErrorCode>[]; };
    testBehaviourDescription: string;
  };
}[]

describe('resultFromHomogeneousErrorList', () => {
  for (const { testInput, testOutcome } of testCasesForResultFromHomogeneousErrorList) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = resultFromHomogeneousErrorList(...testInput.data);
      assert.strictEqual(result.isOk(), testOutcome.data.ok);
      if (result.isOk()) {
        assert.strictEqual(result.value, testOutcome.data.value);
      } else {
        assert.deepStrictEqual(result.error, testOutcome.data.errors);
      }
    });
  }
});

