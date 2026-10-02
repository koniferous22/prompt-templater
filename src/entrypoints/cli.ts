import { input, checkbox } from '@inquirer/prompts';
import { parseCliArguments } from '../modules/args.js';

const processWorkflow = async (workflowFile: string) => {
}

export const main = async () => {
  const passedInputArgs = process.argv.slice(2);
  const cliArgsParseResult = parseCliArguments(passedInputArgs);
  if (!cliArgsParseResult.isOk()) {
    console.error(cliArgsParseResult.error);
  }
  const answer = await input({ message: 'Enter your name' });
};

