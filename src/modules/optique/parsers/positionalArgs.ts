import { argument, map, message, optional, seq } from "@optique/core";
import type { Parser } from "@optique/core/parser";
import { zodAsync } from "@optique/zod";
import { FileSchema, type File } from "../../../validation/schemas/file.js";
import z from "zod";

export const positionalArgsParser = map(
  seq(
    argument(zodAsync(FileSchema, {
      placeholder: "",
      metavar: 'WORKFLOW',
      errors: {
        zodError: (error, input) => {
          // Note - `optique` only renders the first error, likely because of zod/v3 compatibility
          return message`${z.prettifyError(error)}`
        }
      },
    })),
    optional(argument(zodAsync(FileSchema, {
      placeholder: "",
      metavar: 'WORKFLOW_PRESET',
      errors: {
        zodError: (error, input) => {
          // Note - `optique` only renders the first error, likely because of zod/v3 compatibility
          return message`${z.prettifyError(error)}`
        }
      },
    }))),
  ),
  ([workflow, workflowPreset]) => ({ workflow: workflow as File, workflowPreset: workflowPreset as File | undefined }),
  // Note - encountering TS 4023 error - Exported variable 'positionalArgs' has or is using name 'SeqState' from external module "/path/to/project" but cannot be named.
  // hence casting
) as Parser<
  "async",
  {
    workflow: File;
    workflowPreset?: File;
  },
  unknown
>;
