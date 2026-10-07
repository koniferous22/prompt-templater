import { z } from 'zod';
import { errorMessages } from '../../constants/errorMessages.js';

// TODO - migrate to `optique` dependency instead for more robust CLI option handling
export const CliArgsSchema = z
  .array(
    z.string().nonempty({
      error: errorMessages.cliArgsProcessing_emptyStringAsArgument,
    }),
  )
  .length(1, {
    error: errorMessages.cliArgsProcessing_wrongArgumentFormat,
  }).transform(([workflowFile]) => ({
    workflowFile: workflowFile!,
  }));

