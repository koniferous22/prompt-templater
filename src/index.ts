import { runCli } from "./entrypoints/cli.js";
import { handleCliError } from "./utils/error/cliErrorHandler.js";

export const main = handleCliError(runCli);
