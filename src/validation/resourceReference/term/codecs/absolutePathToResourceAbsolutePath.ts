import path from "node:path";

import { match } from "ts-pattern";
import z from "zod";

import { AbsolutePathSchema } from "../../../path/customTypes/index.js";
import { PlainFileTermReferenceOptionsInputSchema } from "../schemas/plainFileReferenceOptions.js";
import { TermResourceAbsolutePathSchema } from "../schemas/termResourceAbsolutePath.js";

export const AbsolutePathToTermResourceAbsolutePath = z.codec(
  AbsolutePathSchema,
  TermResourceAbsolutePathSchema,
  {
    decode: (value) => {
      const extname = path.extname(value);
      const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;
      return (
        match(fileExtension)
          .with("json", () => ({
            format: "json" as const,
            path: value,
            selector: [],
          }))
          .with("yaml", () => ({
            format: "yaml" as const,
            path: value,
            selector: [],
          }))
          .with("yml", () => ({
            format: "yaml" as const,
            path: value,
            selector: [],
          }))
          // Fallback - extension not matching above is treated as plaintext
          .otherwise(() => ({
            format: "plaintext" as const,
            path: value,
            // fallback to default options
            options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
          }))
      );
    },
    encode: (value) => {
      return AbsolutePathSchema.parse(value.path);
    },
  },
);
