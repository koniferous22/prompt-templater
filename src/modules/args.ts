import { CliArgsSchema } from '../validation/schemas/cliArgs.js';
import { createResultFromZodParseResult } from '../utils/deps/neverthrow/createResultFromZodParseResult.js';

export const parseCliArguments = createResultFromZodParseResult(CliArgsSchema);
