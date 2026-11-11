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

type CompositeVariableType = "array" | "object";

export type TemplateVariableSpecAbstractComposite<VariableType extends CompositeVariableType> = {
  specType: "composite";
  variableType: VariableType;
};

export type TemplateVariableSpecArrayComposite = TemplateVariableSpecAbstractComposite<"array"> & {
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

export type TemplateVariableSpecObjectComposite =
  TemplateVariableSpecAbstractComposite<"object"> & {
    objectShapeType: Record<string, TemplateVariableSpecComposite | TemplateVariableSpecPrimitive>;
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
          defaultValue: Record<string, unknown>;
        };
  };

export type TemplateVariableSpecComposite =
  | TemplateVariableSpecArrayComposite
  | TemplateVariableSpecObjectComposite;

export type TemplateVariableSpecs = TemplateVariableSpecPrimitive | TemplateVariableSpecComposite;

export const createTemplateVariableSpecs = <
  const VariableSpecs extends Record<string, TemplateVariableSpecs>,
>(
  inputSpecs: VariableSpecs,
) => {
  const state = inputSpecs;
  const zodSchema = templateVariableSpecsBuildZodSchema(state);
  return {
    getSpecsAsRecord: () => state,
    getSpecs: () => {
      return {
        specType: "composite",
        variableType: "object",
        objectShapeType: state,
        modifier: {
          modifierType: "none",
        },
      } satisfies TemplateVariableSpecs;
    },
    getZodSchema: () => zodSchema,
    createTemplateVariableContext: () =>
      createTemplateVariableContext(state, zodSchema.def.shape as any),
  };
};
