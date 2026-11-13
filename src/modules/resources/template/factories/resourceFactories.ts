import { Ok, ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";

import {
  TemplateEngine,
  type TemplateEngineType,
} from "../../../../constants/enums/templateEngines/templateEngine.js";
import { createError } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { appErrFromThrowable } from "../../../../utils/deps/neverthrow/errorFromThrowable.js";
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
      const renderFn = renderFnSchema.implement(templateInstance.getCompiledTemplate());
      // Wrap to handle neverthrow errors
      // Note for some reason `throw`n error isn't instance of `z.ZodError` - i.e. following condition fails
      // return appErrFromThrowable(renderFn, (error) =>
      //   error instanceof z.ZodError
      //     ? createError("module_resources_template_createRenderFunction_invalidRenderingInput", {
      //         templateFile: context.file,
      //         zodError: error,
      //       })
      //     : createError("module_resources_template_createRenderFunction_unknownError", {
      //         templateFile: context.file,
      //       }),
      // );
      return appErrFromThrowable(renderFn, (error) =>
        createError("module_resources_template_createRenderFunction_invalidRenderingInput", {
          templateFile: context.file,
          zodError: error as z.ZodError,
        }),
      );
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
