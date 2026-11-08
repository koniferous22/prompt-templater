import { match } from "ts-pattern";
import z from "zod";

import type {
  TemplateVariableSpecArrayComposite,
  TemplateVariableSpecComposite,
  TemplateVariableSpecObjectComposite,
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

export type TemplateVariableSpecToZodSchema<Specs extends TemplateVariableSpecs> =
  Specs extends TemplateVariableSpecPrimitive
    ? Specs["variableType"] extends keyof typeof templateVariableSpecPrimitiveSchemas
      ? Specs["modifier"]["modifierType"] extends keyof (typeof templateVariableSpecPrimitiveSchemas)[Specs["variableType"]]
        ? (typeof templateVariableSpecPrimitiveSchemas)[Specs["variableType"]][Specs["modifier"]["modifierType"]] extends (
            ...args: any[]
          ) => any
          ? ReturnType<
              (typeof templateVariableSpecPrimitiveSchemas)[Specs["variableType"]][Specs["modifier"]["modifierType"]]
            >
          : (typeof templateVariableSpecPrimitiveSchemas)[Specs["variableType"]][Specs["modifier"]["modifierType"]]
        : never
      : never
    : Specs extends TemplateVariableSpecComposite
      ? Specs extends TemplateVariableSpecArrayComposite
        ? z.ZodArray<TemplateVariableSpecToZodSchema<Specs["arrayElementType"]>>
        : Specs extends TemplateVariableSpecObjectComposite
          ? z.ZodObject<{
              [key in keyof Specs["objectShapeType"]]: TemplateVariableSpecToZodSchema<
                Specs["objectShapeType"][key]
              >;
            }>
          : never
      : never;

export const templateVariableSpecToZodSchema = <const Specs extends TemplateVariableSpecs>(
  spec: Specs,
): TemplateVariableSpecToZodSchema<Specs> => {
  if (spec.specType === "composite") {
    // @ts-expect-error
    return match(spec as TemplateVariableSpecComposite)
      .with({ variableType: "array", modifier: { modifierType: "none" } }, (arraySpec) => {
        // const innnerSpec = templateVariableSpecsBuildZodSchema(arraySpec.arrayElementType) as z.ZodType;
        const innnerSpec = templateVariableSpecToZodSchema(arraySpec.arrayElementType) as z.ZodType;
        return z.array(innnerSpec);
      })
      .with({ variableType: "array", modifier: { modifierType: "optional" } }, (arraySpec) => {
        const innnerSpec = templateVariableSpecToZodSchema(arraySpec.arrayElementType) as z.ZodType;
        return z.array(innnerSpec).optional();
      })
      .with(
        { variableType: "array", modifier: { modifierType: "optionalWithDefault" } },
        (arraySpec) => {
          const innnerSpec = templateVariableSpecToZodSchema(
            arraySpec.arrayElementType,
          ) as z.ZodType;
          return z.array(innnerSpec).default(arraySpec.modifier.defaultValue);
        },
      )
      .with({ variableType: "object", modifier: { modifierType: "none" } }, (objectSpec) => {
        const objectShape = Object.fromEntries(
          Object.entries(objectSpec.objectShapeType).map(([key, value]) => [
            key,
            // @ts-expect-error type instantiation excessively deep and infinite
            templateVariableSpecToZodSchema(value) as z.ZodType,
          ]),
        );
        return z.object(objectShape);
      })
      .with({ variableType: "object", modifier: { modifierType: "optional" } }, (objectSpec) => {
        const objectShape = Object.fromEntries(
          Object.entries(objectSpec.objectShapeType).map(([key, value]) => [
            key,
            templateVariableSpecToZodSchema(value) as z.ZodType,
          ]),
        );
        return z.object(objectShape).optional();
      })
      .with(
        { variableType: "object", modifier: { modifierType: "optionalWithDefault" } },
        (objectSpec) => {
          const objectShape = Object.fromEntries(
            Object.entries(objectSpec.objectShapeType).map(([key, value]) => [
              key,
              templateVariableSpecToZodSchema(value) as z.ZodType,
            ]),
          );
          return z.object(objectShape).default(objectSpec.modifier.defaultValue);
        },
      )
      .exhaustive();
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
  VariableSpecs extends Record<string, TemplateVariableSpecs>,
> = z.ZodObject<{
  [key in keyof VariableSpecs]: TemplateVariableSpecToZodSchema<VariableSpecs[key]>;
}>;

export const templateVariableSpecsBuildZodSchema = <
  const VariableSpecs extends Record<string, TemplateVariableSpecs>,
>(
  specs: VariableSpecs,
): TemplateVariableSpecsBuildZodSchema<VariableSpecs> => {
  // @ts-expect-error
  return z.object(
    Object.fromEntries(
      Object.entries(specs).map(([key, value]) => [key, templateVariableSpecToZodSchema(value)]),
    ),
  );
};
