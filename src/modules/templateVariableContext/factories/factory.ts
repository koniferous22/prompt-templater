import { ok, Result } from "neverthrow";

import { isNonEmptyArray } from "../../../utils/array/isNonEmptyArray.js";
import { appErr } from "../../../utils/deps/neverthrow/errorFactory.js";
import type {
  SpecsToTypescriptMapper,
  TemplateVariableSpec,
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

export type InferValueTypeFromSpec<Spec extends TemplateVariableSpec> =
  Spec["variableType"] extends keyof typeof typescriptTypeResolutionMapperHelper
    ? Spec["modifier"]["modifierType"] extends keyof (typeof typescriptTypeResolutionMapperHelper)[Spec["variableType"]]
      ? SpecsToTypescriptMapper[(typeof typescriptTypeResolutionMapperHelper)[Spec["variableType"]][Spec["modifier"]["modifierType"]]]
      : never
    : never;

export type InferValues<Specs extends TemplateVariableSpecs> = {
  [key in keyof Specs]: InferValueTypeFromSpec<Specs[key]>;
};

export type InferOptionalValues<Specs extends TemplateVariableSpecs> = {
  [key in keyof Specs]: InferValueTypeFromSpec<Specs[key]> | undefined;
};

export type InferTemplateContextStateFromSpecs<Specs extends TemplateVariableSpecs> = {
  [key in keyof Specs]:
    | {
        type: "uninitialized";
      }
    | {
        type: "initialized";
        value: InferValueTypeFromSpec<Specs[key]>;
      };
};

const buildEmptyTemplateVariableContext = <const Specs extends TemplateVariableSpecs>(
  specs: Specs,
): InferTemplateContextStateFromSpecs<Specs> => {
  // @ts-expect-error
  return Object.fromEntries(Object.keys(specs).map((key) => [key, { type: "uninitialized" }]));
};

export const createTemplateVariableContextValidateAndSetValueFn =
  <
    Specs extends TemplateVariableSpecs,
    ZodSchemas extends { [key in keyof Specs]: TemplateVariableSpecToZodSchema<Specs[key]> },
  >(
    state: InferTemplateContextStateFromSpecs<Specs>,
    zodSchemas: ZodSchemas,
    specs: Specs,
  ) =>
  <Key extends keyof Specs>(key: Key, value: InferValueTypeFromSpec<Specs[Key]>) => {
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
  const Specs extends TemplateVariableSpecs,
>(
  state: InferTemplateContextStateFromSpecs<Specs>,
): Result<InferValues<Specs>, any> => {
  let result: Partial<InferValues<Specs>> = {};
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
  return ok(result as InferValues<Specs>);
};

export const templateVariableContextResolveValues = <const Specs extends TemplateVariableSpecs>(
  state: InferTemplateContextStateFromSpecs<Specs>,
): InferOptionalValues<Specs> => {
  let result: Partial<InferOptionalValues<Specs>> = {};
  for (const [key, value] of Object.entries(state)) {
    if (value.type === "uninitialized") {
      // @ts-expect-error
      result[key] = undefined;
      continue;
    }
    // @ts-expect-error
    result[key] = value.value;
  }
  return result as InferOptionalValues<Specs>;
};

export const createTemplateVariableContext = <
  Specs extends TemplateVariableSpecs,
  ZodSchemas extends { [key in keyof Specs]: TemplateVariableSpecToZodSchema<Specs[key]> },
>(
  specs: Specs,
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
