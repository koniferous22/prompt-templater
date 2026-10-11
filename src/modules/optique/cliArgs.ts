import { map, type InferValue } from "@optique/core";
import { merge } from "@optique/core/constructs";

import { globalOptionsParser } from "./parsers/globalOptions.js";
import { positionalArgsParser } from "./parsers/positionalArgs.js";

export const cliArgsParser = merge(
  map(globalOptionsParser, (globalOptions) => ({ globalOptions })),
  map(positionalArgsParser, (positionalArgs) => ({ positionalArgs })),
);

export type CliArgs = InferValue<typeof cliArgsParser>;
