import path from "node:path";

import { match } from "ts-pattern";
import z from "zod";

import { RelativePathSchema } from "../../../path/customTypes/index.js";
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
        .otherwise(() => ({
          format: "plaintext" as const,
          path: value,
          selector: [],
        }));
    },
    encode: (value) => {
      return RelativePathSchema.parse(value.path);
    },
  },
);
