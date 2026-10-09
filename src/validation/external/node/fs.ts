import { z } from "zod";
import fs from 'node:fs';
import { errorMessages } from "../../../constants/errorMessages.js";

export const FsStatsSchema = z.custom<fs.Stats>(
  (val): val is fs.Stats => val instanceof fs.Stats,
  {
    error: errorMessages.dependency_nodeFs_fsStatInvalidOutputShape(),
  }
);
export type FsStats = z.output<typeof FsStatsSchema>;

// Note - Following doesn't work because of `private` constructor
// export const FsStatsSchema = z.instanceof(fs.Stats);

export const FsDirentSchema = z.instanceof(fs.Dirent);
export type FsDirent = z.output<typeof FsDirentSchema>;