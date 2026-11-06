import Handlebars from "handlebars";
import { ok } from "neverthrow";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import type { Template } from "../../templateEngine.js";
import { extractTemplateConstraintsFromHandlebarsTemplate } from "../methods/extractTemplateConstraintsFromHandlebarsTemplate.js";

export const createHandlebarsTemplate = (
  templateSource: string,
  context: { templateFilePath: AbsolutePath },
) => {
  let ast: hbs.AST.Program;
  try {
    ast = Handlebars.parse(templateSource) as unknown as hbs.AST.Program;
  } catch (e: any) {
    return appErr(
      "module_templateEngines_handlebars_createHandlebarsTemplate_unableToParseInput",
      context,
    );
  }
  const extractTemplateVariableConstraintsResult =
    extractTemplateConstraintsFromHandlebarsTemplate(ast);
  if (!extractTemplateVariableConstraintsResult.isOk()) {
    return extractTemplateVariableConstraintsResult;
  }
  const handlebarsTemplate = {
    getVariableConstraints() {
      return extractTemplateVariableConstraintsResult.value;
    },
    getCompiledTemplate() {
      return Handlebars.compile(ast);
    },
  } satisfies Template;
  return ok(handlebarsTemplate);
};
