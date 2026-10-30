import { createTemplateVariableContext } from "../../templateVariableContext/factories/factory.js";
import { templateVariableSpecsBuildZodSchema } from "../methods/buildZodSchema.js";

export type SpecsToTypescriptMapper = {
  boolean: boolean;
  booleanOrUndefined: boolean | undefined;
  number: number;
  numberOrUndefined: number | undefined;
  string: string;
  stringOrUndefined: string | undefined;
};

type PrimitiveVariableType = "boolean" | "number" | "string";

type TemplateVariableSpecAbstractPrimitive<VariableType extends PrimitiveVariableType> = {
  specType: "primitive";
  variableType: VariableType;
};

export type TemplateVariableSpecPrimitive =
  | (TemplateVariableSpecAbstractPrimitive<"string"> & {
      modifier:
        | {
            modifierType: "none";
          }
        | {
            modifierType: "optional";
          }
        | {
            modifierType: "optionalWithDefault";
            defaultValue: SpecsToTypescriptMapper["string"];
          };
    })
  | (TemplateVariableSpecAbstractPrimitive<"number"> & {
      modifier:
        | {
            modifierType: "none";
          }
        | {
            modifierType: "optional";
          }
        | {
            modifierType: "optionalWithDefault";
            defaultValue: SpecsToTypescriptMapper["number"];
          };
    })
  | (TemplateVariableSpecAbstractPrimitive<"boolean"> & {
      modifier:
        | {
            modifierType: "none";
          }
        | {
            modifierType: "optional";
          }
        | {
            modifierType: "optionalWithDefault";
            defaultValue: SpecsToTypescriptMapper["boolean"];
          };
    });

export type TemplateVariableSpecComposite = {
  specType: "composite";
  variableType: "array";
  arrayElementType: TemplateVariableSpecComposite | TemplateVariableSpecPrimitive;
  modifier:
    | {
        modifierType: "none";
      }
    | {
        modifierType: "optional";
      }
    | {
        modifierType: "optionalWithDefault";
        // TODO - type inferrence too complicated
        defaultValue: any[];
      };
};

export type TemplateVariableSpec = TemplateVariableSpecPrimitive | TemplateVariableSpecComposite;

// For now alias - `handlebars` supports all strings for keys
export type TemplateSupportedString = string;

export type TemplateVariableSpecs = Record<TemplateSupportedString, TemplateVariableSpec>;

export const createTemplateVariableSpecs = <const Specs extends TemplateVariableSpecs>(
  inputSpecs: Specs,
) => {
  const state = inputSpecs;
  const zodSchema = templateVariableSpecsBuildZodSchema(state);
  return {
    getSpecs: () => state,
    getZodSchema: () => zodSchema,
    createTemplateVariableContext: () => createTemplateVariableContext(state, zodSchema.def.shape),
  };
};
