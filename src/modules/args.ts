import { CliArgsSchema } from '../schemas/cliArgs.js';
import { createResultFromZodParseResult } from '../utils/neverthrow/createResultFromZodParseResult.js';

export const parseCliArguments = createResultFromZodParseResult(CliArgsSchema);
