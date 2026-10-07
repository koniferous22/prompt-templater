import { z } from "zod";
import fs from 'node:fs';

export const FsStatsSchema = z.custom<fs.Stats>(
  (val): val is fs.Stats => val instanceof fs.Stats
);

export type FsStats = z.output<typeof FsStatsSchema>; // → fs.Stats

// Note - Following doesn't work because of `private` constructor
// export const FsStatsSchema = z.instanceof(fs.Stats);