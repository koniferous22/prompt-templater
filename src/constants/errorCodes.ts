export type AppErrorCode =
  | 'cliArgsProcessing_emptyStringAsArgument'
  | 'cliArgsProcessing_wrongArgumentFormat'
  | 'dependency_nodeFs_fsReadDirOperationFailed'
  | 'dependency_nodeFs_fsStatInvalidShape'
  | 'dependency_nodeFs_fsStatOperationFailed'
  | 'inputValidation_inputIsNotAbsolutePath'
  | 'inputValidation_absolutePathDoesNotExist'
  | 'inputValidation_absolutePathIsNotFolder'

export type AppError = {
  readonly code: AppErrorCode;
  readonly message: string;
  readonly cause?: unknown;
  readonly meta?: Record<string, unknown>;
};

// Optional: stricter per-code shape if you need different meta
// type ValidationError = { code: 'VALIDATION_FAILED'; message: string; meta: { field: string } }
// type AppError = ValidationError | NetworkError | …
