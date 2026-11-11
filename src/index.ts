import { runCli } from "./entrypoints/cli.js";
import { handleError } from "./utils/error/cliErrorHandler.js";

export const main = handleError(runCli);
