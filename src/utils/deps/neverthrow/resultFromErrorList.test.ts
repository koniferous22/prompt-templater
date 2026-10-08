import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createError, type AppError } from './errorFactory.js';
import type { AppErrorCode } from '../../../constants/errorCodes.js';
import { resultFromErrorList } from './resultFromErrorList.js';

const errorStandalone1 = createError('cliArgsProcessing_emptyStringAsArgument', undefined);
const errorStandalone2 = createError('cliArgsProcessing_wrongArgumentFormat', undefined);

const testCasesForResultErrorList = [
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
      testCaseDescription: 'input consisting of multiple errors of same type',
    },
    testOutcome: {
      data: {
        ok: false,
        errors: [
          errorStandalone1,
          errorStandalone1,
        ],
      },
      testBehaviourDescription: 'return \'err\' with aggregated error of multiple app errors of same type',
    }
  },
  {
    testInput: {
      data: [
        errorStandalone1,
        errorStandalone2,
      ] as AppError<AppErrorCode>[],
      testCaseDescription: 'input consisting of multiple errors of varying types',
    },
    testOutcome: {
      data: {
        ok: false,
        errors: [
          errorStandalone1,
          errorStandalone2,
        ],
      },
      testBehaviourDescription: 'return \'err\' with aggregated error of multiple app errors of varying types',
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

describe('resultFromErrorList', () => {
  for (const { testInput, testOutcome } of testCasesForResultErrorList) {
    it(`for ${testInput.testCaseDescription} it should ${testOutcome.testBehaviourDescription}`, () => {
      const result = resultFromErrorList(...testInput.data);
      assert.strictEqual(result.isOk(), testOutcome.data.ok);
      if (result.isOk()) {
        assert.strictEqual(result.value, testOutcome.data.value);
      } else {
        assert.deepStrictEqual(result.error, testOutcome.data.errors);
      }
    });
  }
});
