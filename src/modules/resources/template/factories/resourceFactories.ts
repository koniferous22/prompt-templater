import { Ok, ok } from "neverthrow";
import { match } from "ts-pattern";

import {
  TemplateEngine,
  type TemplateEngineType,
} from "../../../../constants/enums/templateEngines/templateEngine.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import { createTemplateRenderFunctionSchema } from "../../../../validation/resources/template/factory/factory/templateRenderFunction.js";
import { createHandlebarsTemplate } from "../../../templateEngines/handlebars/factory/factory.js";
import type { ConfigResourceTypes } from "../../config/factories/resourceFactories.js";

export const createTemplate = (
  templateFileContents: string,
  format: TemplateEngineType,
  dependencies: {
    sourceWorkflow: ConfigResourceTypes["workflow"];
  },
  context: {
    file: AbsolutePath;
  },
) => {
  const templateVariableSpecs = dependencies.sourceWorkflow.getTemplateVariableSpecs();
  const templateInstanceResult = match(format)
    .with(TemplateEngine.Handlebars, () =>
      createHandlebarsTemplate(templateFileContents, templateVariableSpecs.getSpecs(), {
        templateFilePath: context.file,
        sourceWorkflowFilePath: dependencies.sourceWorkflow.getAbsolutePath(),
      }),
    )
    .exhaustive();
  if (!templateInstanceResult.isOk()) {
    return templateInstanceResult;
  }
  const templateInstance = templateInstanceResult.value;
  const inputObject = {
    getAbsolutePath: () => context.file,
    validateInputShape: () => templateInstance.validateWithExpectedVariableSpecs(),
    createUnsafeRenderFunction: () => {
      return templateInstance.getCompiledTemplate() as (arg: any) => string;
    },
    createRenderFunction: () => {
      const renderFnSchema = createTemplateRenderFunctionSchema(
        templateVariableSpecs.getZodSchema(),
      );
      return renderFnSchema.implement(templateInstance.getCompiledTemplate());
    },
  };
  return ok(inputObject);
};

export const templateResourceFactories = {
  template: createTemplate,
};

export type TemplateResourceTypes = {
  [key in keyof typeof templateResourceFactories]: Extract<
    ReturnType<(typeof templateResourceFactories)[key]>,
    Ok<any, any>
  > extends Ok<infer Wrapped, any>
    ? Wrapped
    : never;
};
