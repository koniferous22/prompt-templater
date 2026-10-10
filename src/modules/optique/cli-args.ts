import { object } from "@optique/core/constructs";
import { option } from "@optique/core/primitives";
import { message } from "@optique/core/message";
import { bindEnv, createEnvContext } from "@optique/env";
import { zod } from "@optique/zod";
import { NonEmptyStringSchema } from "../../validation/customTypes/string.js";

const envContext = createEnvContext({
  prefix: "PROMPT_TEMPLATER",
});

const contextValueParser = zod(NonEmptyStringSchema, {
  // placeholder unused because of no prompting library on top of CLI
  placeholder: "",
  metavar: "CONTEXT",
});

const context = bindEnv(
  option("--context", "-ctx", contextValueParser, {
    description: message`Test input value (required).`,
  }),
  {
    context: envContext,
    key: "CONTEXT",
    parser: contextValueParser,
    // no default - it should fail if missing from both CLI and env vars
  },
);

export const parser = object({
  context,
});
