import { argument, map, optional, seq, string } from "@optique/core";
import type { Parser } from "@optique/core/parser";

export const positionalArgsParser = map(
  seq(
    argument(string({ metavar: "WORKFLOW" })),
    optional(argument(string({ metavar: "WORKFLOW_PRESET" }))),
  ),
  ([workflow, workflowPreset]) => ({ workflow, workflowPreset }),
  // Note - encountering TS 4023 error - Exported variable 'positionalArgs' has or is using name 'SeqState' from external module "/path/to/project" but cannot be named.
  // hence casting
) as Parser<
  "sync",
  {
    workflow: string;
    workflowPreset?: string;
  },
  unknown
>;
