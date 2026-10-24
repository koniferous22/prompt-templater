import { match } from "ts-pattern";
import z from "zod";

import {
  AbsolutePathSchema,
  RelativePathSchema,
  type AbsolutePath,
  type RelativePath,
} from "../../../path/customTypes/index.js";
import { JsonFilepathSchema, YamlFilepathSchema } from "../../../path/schemas/pathWithExtension.js";
import { PlainFileTermReferenceOptionsInputSchema } from "../schemas/plainFileReferenceOptions.js";
import { SelectorSchema } from "../schemas/selector.js";
import { TermResourceReferenceSchema } from "../schemas/termResourceReference.js";

const WorkflowChoicesFragmentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("jsonFile"),
    file: JsonFilepathSchema,
    selector: SelectorSchema.nullable(),
  }),
  z.object({
    type: z.literal("yamlFile"),
    file: YamlFilepathSchema,
    selector: SelectorSchema.nullable(),
  }),
  z.object({
    type: z.literal("plainFile"),
    file: z.union([AbsolutePathSchema, RelativePathSchema]),
    options: PlainFileTermReferenceOptionsInputSchema,
  }),
]);

const isAbsolutePath = (filePath: AbsolutePath | RelativePath): filePath is AbsolutePath =>
  AbsolutePathSchema.validate(filePath);

export const WorkflowChoicesFragmentToTermResourceReference = z.codec(
  WorkflowChoicesFragmentSchema,
  TermResourceReferenceSchema,
  {
    decode: (value) => {
      return match(value)
        .with({ type: "jsonFile" }, (valueAsJsonFile) => {
          return isAbsolutePath(valueAsJsonFile.file)
            ? {
                type: "absolute" as const,
                filePath: {
                  format: "json" as const,
                  path: valueAsJsonFile.file,
                  selector: valueAsJsonFile.selector,
                },
              }
            : {
                type: "relative" as const,
                filePath: {
                  format: "json" as const,
                  path: valueAsJsonFile.file,
                  selector: valueAsJsonFile.selector,
                },
              };
        })
        .with({ type: "yamlFile" }, (valueAsYamlFile) => {
          return isAbsolutePath(valueAsYamlFile.file)
            ? {
                type: "absolute" as const,
                filePath: {
                  format: "yaml" as const,
                  path: valueAsYamlFile.file,
                  selector: valueAsYamlFile.selector,
                },
              }
            : {
                type: "relative" as const,
                filePath: {
                  format: "yaml" as const,
                  path: valueAsYamlFile.file,
                  selector: valueAsYamlFile.selector,
                },
              };
        })
        .with({ type: "plainFile" }, (valueAsPlainFile) => {
          return isAbsolutePath(valueAsPlainFile.file)
            ? {
                type: "absolute" as const,
                filePath: {
                  format: "plaintext" as const,
                  path: valueAsPlainFile.file,
                  options: valueAsPlainFile.options,
                },
              }
            : {
                type: "relative" as const,
                filePath: {
                  format: "plaintext" as const,
                  path: valueAsPlainFile.file,
                  options: valueAsPlainFile.options,
                },
              };
        })
        .exhaustive();
    },
    // Note - unused
    encode: (value) => {
      return match(value.filePath)
        .with({ format: "json" }, (valueFilePathAsJson) => {
          return {
            type: "jsonFile" as const,
            // Note - unused, otherwise refactor to `.safeParse` + define error code
            file: JsonFilepathSchema.parse(valueFilePathAsJson.path),
            // Note - unused, otherwise refactor to `.safeParse` + define error code
            selector: SelectorSchema.parse(valueFilePathAsJson.selector),
          };
        })
        .with({ format: "yaml" }, (valueFilePathAsYaml) => {
          return {
            type: "yamlFile" as const,
            // Note - unused, otherwise refactor to `.safeParse` + define error code
            file: YamlFilepathSchema.parse(valueFilePathAsYaml.path),
            // Note - unused, otherwise refactor to `.safeParse` + define error code
            selector: SelectorSchema.parse(valueFilePathAsYaml.selector),
          };
        })
        .with({ format: "plaintext" }, (valueFilePathAsPlaintext) => {
          return {
            type: "plainFile" as const,
            // Note - unused, otherwise refactor to `.safeParse` + define error code
            file: z
              .union([AbsolutePathSchema, RelativePathSchema])
              .parse(valueFilePathAsPlaintext.path),
            // Note - unused, otherwise refactor to `.safeParse` + define error code
            options: valueFilePathAsPlaintext.options,
          };
        })
        .exhaustive();
    },
  },
);
