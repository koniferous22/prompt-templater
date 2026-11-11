import { message } from "@optique/core/message";
import { run } from "@optique/run";

import { cliArgsParser } from "../modules/optique/cliArgs.js";
import { envContext } from "../modules/optique/context/env.js";
import { createSessionFromCliInput } from "../modules/session/sessionFromCliInput.js";

export const runCli = async () => {
  const cliInput = await run(cliArgsParser, {
    programName: "prompt-templater-v1",
    contexts: [envContext],
    help: "option",
    brief: message`"prompt-templater" ~ interactive templating util for quick text composition`,
  });
  const sessionResult = await createSessionFromCliInput(cliInput);
  if (!sessionResult.isOk()) {
    return sessionResult;
  }
  return sessionResult.value.run();
};
