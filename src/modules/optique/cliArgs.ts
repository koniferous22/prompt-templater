import { map, type InferValue } from "@optique/core";
import { merge } from "@optique/core/constructs";

import { globalOptionsParser } from "./parsers/globalOptions.js";
import { positionalArgsParser } from "./parsers/positionalArgs.js";
import { runCommandOptionsParser } from "./parsers/runCommandOptions.js";

export const cliArgsParser = merge(
  map(globalOptionsParser, (globalOptions) => ({ globalOptions })),
  map(runCommandOptionsParser, (runCommandOptions) => ({ runCommandOptions })),
  map(positionalArgsParser, (positionalArgs) => ({ positionalArgs })),
);

export type CliArgs = InferValue<typeof cliArgsParser>;
