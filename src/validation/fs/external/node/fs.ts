import fs from "node:fs";

import { z } from "zod";

export const FsDirentSchema = z.instanceof(fs.Dirent);
export type FsDirent = z.output<typeof FsDirentSchema>;
