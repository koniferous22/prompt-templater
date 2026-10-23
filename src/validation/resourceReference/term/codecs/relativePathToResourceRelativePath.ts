import path from "node:path";

import { match } from "ts-pattern";
import z from "zod";

import { RelativePathSchema } from "../../../path/customTypes/index.js";
import { PlainFileTermReferenceOptionsInputSchema } from "../schemas/plainFileReferenceOptions.js";
import { TermResourceRelativePathSchema } from "../schemas/termResourceRelativePath.js";

export const RelativePathToTermResourceRelativePath = z.codec(
  RelativePathSchema,
  TermResourceRelativePathSchema,
  {
    decode: (value) => {
      const extname = path.extname(value);
      const fileExtension = extname.startsWith(".") ? extname.slice(1) : extname;
      return match(fileExtension)
        .with("json", () => ({
          format: "json" as const,
          path: value,
          selector: null,
        }))
        .with("yaml", () => ({
          format: "yaml" as const,
          path: value,
          selector: null,
        }))
        .with("yml", () => ({
          format: "yaml" as const,
          path: value,
          selector: null,
        }))
        .otherwise(() => ({
          format: "plaintext" as const,
          path: value,
          // fallback to default options
          options: PlainFileTermReferenceOptionsInputSchema.parse(undefined),
        }));
    },
    encode: (value) => {
      return RelativePathSchema.parse(value.path);
    },
  },
);
