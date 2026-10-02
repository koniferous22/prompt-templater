import { z } from 'zod';
import { CLI_ARGS_PROCESSING__EMPTY_STRING, CLI_ARGS_PROCESSING__EXPECTED_1_ARGUMENT } from '../constants/errorMessages.js';

export const CliArgsSchema = z
  .array(
    z.string().nonempty({
      error: CLI_ARGS_PROCESSING__EMPTY_STRING,
    }),
  )
  .length(1, {
    error: CLI_ARGS_PROCESSING__EXPECTED_1_ARGUMENT,
  }).transform(([workflowFile]) => ({
    workflowFile: workflowFile!,
  }));

