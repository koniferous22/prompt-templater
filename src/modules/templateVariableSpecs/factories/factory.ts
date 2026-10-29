import { templateVariableSpecsBuildZodSchema } from "../methods/buildZodSchema.js";

type PrimitiveVariableTypeToLiteralType = {
  boolean: boolean;
  number: number;
  string: string;
};

type PrimitiveVariableType = keyof PrimitiveVariableTypeToLiteralType;

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
            defaultValue: PrimitiveVariableTypeToLiteralType["string"];
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
            defaultValue: PrimitiveVariableTypeToLiteralType["number"];
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
            defaultValue: PrimitiveVariableTypeToLiteralType["boolean"];
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
  return {
    getSpecs: () => state,
    buildZodSchema: () => templateVariableSpecsBuildZodSchema(state),
    // TBD
    createTemplateVariableContext: () => null,
  };
};
