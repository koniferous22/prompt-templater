import { match } from "ts-pattern";
import z from "zod";

import type {
  TemplateSupportedString,
  TemplateVariableSpec,
  TemplateVariableSpecComposite,
  TemplateVariableSpecPrimitive,
  TemplateVariableSpecs,
} from "../factories/factory.js";

const templateVariableSpecPrimitiveSchemas = {
  boolean: {
    none: z.boolean(),
    optional: z.boolean().optional(),
    optionalWithDefault: (defaultValue: boolean) => z.boolean().default(defaultValue),
  },
  number: {
    none: z.number(),
    optional: z.number().optional(),
    optionalWithDefault: (defaultValue: number) => z.number().default(defaultValue),
  },
  string: {
    none: z.string(),
    optional: z.string().optional(),
    optionalWithDefault: (defaultValue: string) => z.string().default(defaultValue),
  },
} satisfies {
  [typeKey in TemplateVariableSpecPrimitive["variableType"]]: {
    [
      modifierKey in Extract<
        TemplateVariableSpecPrimitive,
        { variableType: typeKey }
      >["modifier"]["modifierType"]
    ]: z.ZodType | ((...args: any[]) => z.ZodType);
  };
};

export type TemplateVariableSpecToZodSchema<Spec extends TemplateVariableSpec> =
  Spec extends TemplateVariableSpecPrimitive
    ? Spec["variableType"] extends keyof typeof templateVariableSpecPrimitiveSchemas
      ? Spec["modifier"]["modifierType"] extends keyof (typeof templateVariableSpecPrimitiveSchemas)[Spec["variableType"]]
        ? (typeof templateVariableSpecPrimitiveSchemas)[Spec["variableType"]][Spec["modifier"]["modifierType"]] extends (
            ...args: any[]
          ) => any
          ? ReturnType<
              (typeof templateVariableSpecPrimitiveSchemas)[Spec["variableType"]][Spec["modifier"]["modifierType"]]
            >
          : (typeof templateVariableSpecPrimitiveSchemas)[Spec["variableType"]][Spec["modifier"]["modifierType"]]
        : never
      : never
    : Spec extends TemplateVariableSpecComposite
      ? Spec["variableType"] extends "array"
        ? z.ZodArray<TemplateVariableSpecToZodSchema<Spec["arrayElementType"]>>
        : never
      : never;

export const templateVariableSpecToZodSchema = <const Spec extends TemplateVariableSpec>(
  spec: Spec,
): TemplateVariableSpecToZodSchema<Spec> => {
  if (spec.specType === "composite") {
    // Array only case for now
    // Note - `ts-pattern` not used because inference doesn't work correctly on recursion
    // @ts-expect-error excessively infinite instantiation
    return z.array(templateVariableSpecToZodSchema(spec.arrayElementType));
  }
  // @ts-expect-error
  return match(spec as TemplateVariableSpecPrimitive)
    .with(
      { variableType: "boolean", modifier: { modifierType: "none" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ],
    )
    .with(
      { variableType: "boolean", modifier: { modifierType: "optional" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ],
    )
    .with(
      { variableType: "boolean", modifier: { modifierType: "optionalWithDefault" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ](matchedItem.modifier.defaultValue),
    )
    .with(
      { variableType: "number", modifier: { modifierType: "none" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ],
    )
    .with(
      { variableType: "number", modifier: { modifierType: "optional" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ],
    )
    .with(
      { variableType: "number", modifier: { modifierType: "optionalWithDefault" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ](matchedItem.modifier.defaultValue),
    )
    .with(
      { variableType: "string", modifier: { modifierType: "none" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ],
    )
    .with(
      { variableType: "string", modifier: { modifierType: "optional" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ],
    )
    .with(
      { variableType: "string", modifier: { modifierType: "optionalWithDefault" } },
      (matchedItem) =>
        templateVariableSpecPrimitiveSchemas[matchedItem.variableType][
          matchedItem.modifier.modifierType
        ](matchedItem.modifier.defaultValue),
    )
    .exhaustive() satisfies z.ZodType;
};

export type TemplateVariableSpecsBuildZodSchema<
  Specs extends Record<TemplateSupportedString, TemplateVariableSpec>,
> = z.ZodObject<{
  [key in keyof Specs]: TemplateVariableSpecToZodSchema<Specs[key]>;
}>;

export const templateVariableSpecsBuildZodSchema = <const Specs extends TemplateVariableSpecs>(
  specs: Specs,
): TemplateVariableSpecsBuildZodSchema<Specs> => {
  // @ts-expect-error
  return z.object(
    Object.fromEntries(
      Object.entries(specs).map(([key, value]) => [key, templateVariableSpecToZodSchema(value)]),
    ),
  );
};
