import { argument, map, message, optional, seq } from "@optique/core";
import type { Parser } from "@optique/core/parser";
import { zod } from "@optique/zod";
import z from "zod";

import { NonEmptyStringToAbsoluteOrRelativeConfigPath } from "../../../validation/codecs/nonEmptyStringToAbsoluteOrRelativeConfigPath.js";
import { YamlRelativePathSchema } from "../../../validation/schemas/pathWithExtensions.js";

export type WorkspaceContextPath = z.output<typeof NonEmptyStringToAbsoluteOrRelativeConfigPath>;

export const positionalArgsParser = map(
  seq(
    argument(
      zod<WorkspaceContextPath>(NonEmptyStringToAbsoluteOrRelativeConfigPath, {
        placeholder: {
          type: "relative",
          path: YamlRelativePathSchema.parse("file.yaml"),
        },
        metavar: "WORKFLOW",
        errors: {
          zodError: (error) => {
            // Note - `optique` only renders the first error, likely because of zod/v3 compatibility
            return message`${z.prettifyError(error)}`;
          },
        },
      }),
    ),
    optional(
      argument(
        zod<WorkspaceContextPath>(NonEmptyStringToAbsoluteOrRelativeConfigPath, {
          placeholder: {
            type: "relative",
            path: YamlRelativePathSchema.parse("file.yaml"),
          },
          metavar: "WORKFLOW_PRESET",
          errors: {
            zodError: (error) => {
              // Note - `optique` only renders the first error, likely because of zod/v3 compatibility
              return message`${z.prettifyError(error)}`;
            },
          },
        }),
      ),
    ),
  ),
  ([workflow, workflowPreset]) => ({ workflow, workflowPreset }),
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
