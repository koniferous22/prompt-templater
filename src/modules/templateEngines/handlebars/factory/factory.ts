import Handlebars from "handlebars";
import { ok } from "neverthrow";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import type { TemplateVariableSpecs } from "../../../templateVariableSpecs/factories/factory.js";
import type { Template } from "../../templateEngine.js";
import { handlebarsTemplateValidateWithExpectedVariableSpecs } from "../methods/validateWithExpectedVariableSpecs.js";

// TODO - make polyfill conditional on basis of features
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

export const createHandlebarsTemplate = (
  templateSource: string,
  specs: TemplateVariableSpecs,
  context: {
    templateFilePath: AbsolutePath;
    sourceWorkflowFilePath: AbsolutePath;
  },
) => {
  let ast: hbs.AST.Program;
  try {
    ast = Handlebars.parse(templateSource) as unknown as hbs.AST.Program;
  } catch {
    return appErr(
      "module_templateEngines_handlebars_createHandlebarsTemplate_unableToParseInput",
      context,
    );
  }
  const handlebarsTemplate = {
    // Note - validation hidden under callback, in case it needs to be turned off, for errors that I don't have time to fix
    // Invoked in `Template` resource unless flags have been configured to skip this check
    validateWithExpectedVariableSpecs: () =>
      handlebarsTemplateValidateWithExpectedVariableSpecs(ast, specs, {
        templateFile: context.templateFilePath,
        sourceWorkflowFile: context.sourceWorkflowFilePath,
      }),
    getCompiledTemplate() {
      return Handlebars.compile(ast);
    },
  } satisfies Template;
  return ok(handlebarsTemplate);
};
