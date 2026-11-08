import { ok, Result } from "neverthrow";

import { isNonEmptyArray } from "../../../utils/array/isNonEmptyArray.js";
import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import type {
  SpecsToTypescriptMapper,
  TemplateVariableSpecArrayComposite,
  TemplateVariableSpecObjectComposite,
  TemplateVariableSpecPrimitive,
  TemplateVariableSpecs,
} from "../../templateVariableSpecs/factories/factory.js";
import { type TemplateVariableSpecToZodSchema } from "../../templateVariableSpecs/methods/buildZodSchema.js";

const typescriptTypeResolutionMapperHelper = {
  boolean: {
    none: "boolean",
    optional: "booleanOrUndefined",
    optionalWithDefault: "boolean",
  },
  number: {
    none: "number",
    optional: "numberOrUndefined",
    optionalWithDefault: "number",
  },
  string: {
    none: "string",
    optional: "stringOrUndefined",
    optionalWithDefault: "string",
  },
} satisfies {
  [typeKey in TemplateVariableSpecPrimitive["variableType"]]: {
    [
      modifierKey in Extract<
        TemplateVariableSpecPrimitive,
        { variableType: typeKey }
      >["modifier"]["modifierType"]
    ]: keyof SpecsToTypescriptMapper;
  };
};

export type InferValueTypeFromSpecs<Specs extends TemplateVariableSpecs> =
  Specs["specType"] extends "primitive"
    ? Specs["variableType"] extends keyof typeof typescriptTypeResolutionMapperHelper
      ? Specs["modifier"]["modifierType"] extends keyof (typeof typescriptTypeResolutionMapperHelper)[Specs["variableType"]]
        ? SpecsToTypescriptMapper[(typeof typescriptTypeResolutionMapperHelper)[Specs["variableType"]][Specs["modifier"]["modifierType"]]]
        : never
      : never
    : Specs["specType"] extends "composite"
      ? Specs extends TemplateVariableSpecArrayComposite
        ? Specs["modifier"] extends { modifierType: "optional" }
          ? Array<InferValueTypeFromSpecs<Specs["arrayElementType"]>> | undefined
          : // i.e. for array with default value and required array infer array with proper value type, i.e. without potential `undefined`
            Array<InferValueTypeFromSpecs<Specs["arrayElementType"]>>
        : Specs extends TemplateVariableSpecObjectComposite
          ? Specs["modifier"] extends { modifierType: "optional" }
            ?
                | {
                    [key in keyof Specs["objectShapeType"]]: InferValueTypeFromSpecs<
                      Specs["objectShapeType"][key]
                    >;
                  }
                | undefined
            : // i.e. for object with default value and required array infer object with proper value type, i.e. without potential `undefined`
              {
                [key in keyof Specs["objectShapeType"]]: InferValueTypeFromSpecs<
                  Specs["objectShapeType"][key]
                >;
              }
          : never
      : never;

export type InferValues<VariableSpecs extends Record<string, TemplateVariableSpecs>> = {
  [key in keyof VariableSpecs]: InferValueTypeFromSpecs<VariableSpecs[key]>;
};

export type InferOptionalValues<VariableSpecs extends Record<string, TemplateVariableSpecs>> = {
  [key in keyof VariableSpecs]: InferValueTypeFromSpecs<VariableSpecs[key]> | undefined;
};

export type InferTemplateContextStateFromSpecs<
  VariableSpecs extends Record<string, TemplateVariableSpecs>,
> = {
  [key in keyof VariableSpecs]:
    | {
        type: "uninitialized";
      }
    | {
        type: "initialized";
        value: InferValueTypeFromSpecs<VariableSpecs[key]>;
      };
};

const buildEmptyTemplateVariableContext = <
  const VariableSpecs extends Record<string, TemplateVariableSpecs>,
>(
  specs: VariableSpecs,
): InferTemplateContextStateFromSpecs<VariableSpecs> => {
  // @ts-expect-error
  return Object.fromEntries(Object.keys(specs).map((key) => [key, { type: "uninitialized" }]));
};

export const createTemplateVariableContextValidateAndSetValueFn =
  <
    VariableSpecs extends Record<string, TemplateVariableSpecs>,
    ZodSchemas extends {
      [key in keyof VariableSpecs]: TemplateVariableSpecToZodSchema<VariableSpecs[key]>;
    },
  >(
    state: InferTemplateContextStateFromSpecs<VariableSpecs>,
    zodSchemas: ZodSchemas,
    specs: VariableSpecs,
  ) =>
  <Key extends keyof VariableSpecs>(
    key: Key,
    value: InferValueTypeFromSpecs<VariableSpecs[Key]>,
  ) => {
    const fieldZodSchema = zodSchemas[key];
    if (fieldZodSchema === undefined) {
      return appErr("module_templateVariableContext_setValue_keyNotFound", {
        variableName: key as string,
      });
    }
    if (!(fieldZodSchema as ZodSchemas[Key]).validate(value)) {
      return appErr("module_templateVariableContext_setValue_invalidValueType", {
        variableName: key as string,
        expectedType: specs[key]?.variableType ?? "unknown",
        stringifiedValue: String(value),
      });
    }
    state[key] = {
      type: "initialized",
      value,
    };
    return ok(state);
  };

export const templateVariableContextResolveValuesStrict = <
  const VariableSpecs extends Record<string, TemplateVariableSpecs>,
>(
  state: InferTemplateContextStateFromSpecs<VariableSpecs>,
): Result<InferValues<VariableSpecs>, any> => {
  let result: Partial<InferValues<VariableSpecs>> = {};
  const uninitializeFields: string[] = [];
  for (const [key, value] of Object.entries(state)) {
    if (value.type === "uninitialized") {
      uninitializeFields.push(key);
      continue;
    }
    // @ts-expect-error
    result[key] = value.value;
  }
  if (isNonEmptyArray(uninitializeFields)) {
    // TODO - consider returning here aggregate error
    return appErr("module_templateVariableContext_resolveValuesStrict_unintializedState", {
      missingFields: uninitializeFields,
    });
  }
  return ok(result as InferValues<VariableSpecs>);
};

export const templateVariableContextResolveValues = <
  const VariableSpecs extends Record<string, TemplateVariableSpecs>,
>(
  state: InferTemplateContextStateFromSpecs<VariableSpecs>,
): InferOptionalValues<VariableSpecs> => {
  let result: Partial<InferOptionalValues<VariableSpecs>> = {};
  for (const [key, value] of Object.entries(state)) {
    if (value.type === "uninitialized") {
      // @ts-expect-error
      result[key] = undefined;
      continue;
    }
    // @ts-expect-error
    result[key] = value.value;
  }
  return result as InferOptionalValues<VariableSpecs>;
};

export const createTemplateVariableContext = <
  VariableSpecs extends Record<string, TemplateVariableSpecs>,
  ZodSchemas extends {
    [key in keyof VariableSpecs]: TemplateVariableSpecToZodSchema<VariableSpecs[key]>;
  },
>(
  specs: VariableSpecs,
  zodSchemas: ZodSchemas,
) => {
  const state = buildEmptyTemplateVariableContext(specs);
  const object = {
    setValue: createTemplateVariableContextValidateAndSetValueFn(state, zodSchemas, specs),
    resolveValues: () => templateVariableContextResolveValues(state),
    resolveValuesStrict: () => templateVariableContextResolveValuesStrict(state),
  };
  return object;
};

export type TemplateVariableContext<
  VariableSpecs extends Record<string, TemplateVariableSpecs>,
  ZodSchemas extends {
    [key in keyof VariableSpecs]: TemplateVariableSpecToZodSchema<VariableSpecs[key]>;
  },
> = ReturnType<typeof createTemplateVariableContext<VariableSpecs, ZodSchemas>>;
