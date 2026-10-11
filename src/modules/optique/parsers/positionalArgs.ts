import { argument, map, message, optional, seq } from "@optique/core";
import type { Parser } from "@optique/core/parser";
import { zod } from "@optique/zod";
import type { File } from "../../../validation/schemas/file.js";
import z from "zod";
import { WorkspaceContextPathSchema } from "../../../validation/schemas/workspaceContext.js";

export type WorkspaceContextPath = z.output<typeof WorkspaceContextPathSchema>;

export const positionalArgsParser = map(
  seq(
    argument(zod(WorkspaceContextPathSchema, {
      placeholder: "",
      metavar: 'WORKFLOW',
      errors: {
        zodError: (error) => {
          // Note - `optique` only renders the first error, likely because of zod/v3 compatibility
          return message`${z.prettifyError(error)}`
        }
      },
    })),
    optional(argument(zod(WorkspaceContextPathSchema, {
      placeholder: "",
      metavar: 'WORKFLOW_PRESET',
      errors: {
        zodError: (error) => {
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
  "sync",
  {
    workflow: WorkspaceContextPath;
    workflowPreset?: WorkspaceContextPath;
  },
  unknown
>;
