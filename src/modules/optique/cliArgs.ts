import { merge } from "@optique/core/constructs";
import { globalOptionsParser } from "./parsers/globalOptions.js";
import { positionalArgs } from "./parsers/positionalArgs.js";

export const cliArgsParser = merge(
  globalOptionsParser,
  positionalArgs,
)
