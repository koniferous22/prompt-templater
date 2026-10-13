import { object, option, optional } from "@optique/core";
import { message } from "@optique/core/message";
import { bindEnv } from "@optique/env";
import { zodAsync } from "@optique/zod";
import z from "zod";

import { WorkspaceContextSchema } from "../../../validation/schemas/workspaceContext.js";
import { envContext } from "../context/env.js";

const contextValueParser = zodAsync<z.output<typeof WorkspaceContextSchema>>(
  // @ts-expect-error minor branded type inconsistency
  WorkspaceContextSchema,
  {
    // placeholder unused because of no prompting library on top of CLI
    placeholder: "",
    metavar: "CONTEXT",
    errors: {
      zodError: (error) => {
        // Note - `optique` only renders the first error, likely because of zod/v3 compatibility
        return message`${z.prettifyError(error)}`;
      },
    },
  },
);

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
});
