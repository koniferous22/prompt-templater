import { run } from '@optique/run';
import { cliArgsParser } from '../modules/optique/cli-args.js';
import { envContext } from '../modules/optique/context/env.js';
import { message } from '@optique/core/message';

const processWorkflow = async (workflowFile: string) => {
}

export const main = async () => {
  const cliInput = await run(cliArgsParser, {
    programName: "prompt-templater-v1",
    contexts: [envContext],
    help: "option",
    brief: message`Templating clipboard util for making prompt typing more efficient`,
  });
  console.log(JSON.stringify(cliInput, null, 2));
};
