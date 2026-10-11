import { zodAsync } from "@optique/zod";
import { WorkspaceContextSchema } from "../../../validation/schemas/workspaceContext.js";
import z from "zod";
import { message } from "@optique/core/message";
import { object, option, optional } from "@optique/core";
import { bindEnv } from "@optique/env";
import { envContext } from "../context/env.js";

const contextValueParser = zodAsync(WorkspaceContextSchema, {
  // placeholder unused because of no prompting library on top of CLI
  placeholder: "",
  metavar: "CONTEXT",
  errors: {
    zodError: (error, input) => {
      // Note - `optique` only renders the first error, likely because of zod/v3 compatibility
      return message`${z.prettifyError(error)}`
    }
  },
});

// Note - null default value results in errors, hence using `optional`
const context = optional(
  bindEnv(
    option("--context", "-ctx", contextValueParser, {
      description: message`Test input value (required).`,
    }),
    {
      context: envContext,
      key: "CONTEXT",
      parser: contextValueParser,
    },
  ),
);

export const globalOptionsParser = object({
  context,
})

