import { z } from 'zod';
import { messages } from '../../constants/errorMessages.js';

// TODO - migrate to `optique` dependency instead for more robust CLI option handling
export const CliArgsSchema = z
  .array(
    z.string().nonempty({
      error: messages.cliArgsProcessing_emptyStringAsArgument,
    }),
  )
  .length(1, {
    error: messages.cliArgsProcessing_wrongArgumentFormat,
  }).transform(([workflowFile]) => ({
    workflowFile: workflowFile!,
  }));

