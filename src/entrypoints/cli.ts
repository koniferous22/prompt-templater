import { runAsync } from '@optique/run';
import { parser } from '../modules/optique/cli-args.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AbsolutePathSchema } from '../validation/customTypes/path.js';

const processWorkflow = async (workflowFile: string) => {
}

export const main = async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const projectRoot = AbsolutePathSchema.parse(join(__dirname, '../../'))
  const projectFixturesFolder = AbsolutePathSchema.parse(join(projectRoot, 'fixtures'));
  const workspace1Folder = AbsolutePathSchema.parse(join(projectFixturesFolder, 'workspace1'));
  const config = await runAsync(parser, {
    args: ["--context", workspace1Folder],
  });
  console.log(JSON.stringify(config, null, 2));
};
