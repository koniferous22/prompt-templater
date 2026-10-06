import { z } from 'zod';
import { messages } from '../constants/errorMessages.js';

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

