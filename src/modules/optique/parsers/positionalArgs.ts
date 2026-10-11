import { argument, map, optional, seq, string } from "@optique/core";
import type { Parser } from "@optique/core/parser";
import { zodAsync } from "@optique/zod";
import { FileSchema, type File } from "../../../validation/schemas/file.js";

export const positionalArgsParser = map(
  seq(
    argument(zodAsync(FileSchema, {
      placeholder: "",
      metavar: 'WORKFLOW',
    })),
    optional(argument(zodAsync(FileSchema, {
      placeholder: "",
      metavar: 'WORKFLOW_PRESET',
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
