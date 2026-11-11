import clipboard from "clipboardy";
import { ok } from "neverthrow";

import type { TemplateResourceTypes } from "../../../resources/template/factories/resourceFactories.js";
import type { TemplateVariableContext } from "../../../templateVariableContext/factories/factory.js";
import type { TemplateVariableSpecs } from "../../../templateVariableSpecs/factories/factory.js";
import type { TemplateVariableSpecToZodSchema } from "../../../templateVariableSpecs/methods/buildZodSchema.js";

type Options = {
  unsafeRender: boolean;
  shouldPrintToStdout: boolean;
  shouldCopyToClipboard: boolean;
};

const generateOutput = async (
  output: string,
  options: Pick<Options, "shouldCopyToClipboard" | "shouldPrintToStdout">,
) => {
  if (options.shouldCopyToClipboard) {
    // TODO - error handling
    await clipboard.write(output);
  }
  if (options.shouldPrintToStdout) {
    process.stdout.write(output);
  }
  return ok(undefined);
};

export const inquirerSessionGenerateOutput = async <
  VariableSpecs extends Record<string, TemplateVariableSpecs>,
  ZodSchemas extends {
    [key in keyof VariableSpecs]: TemplateVariableSpecToZodSchema<VariableSpecs[key]>;
  },
>(
  templateResource: TemplateResourceTypes["template"],
  templateVariableContext: TemplateVariableContext<VariableSpecs, ZodSchemas>,
  options: Options,
) => {
  if (options.unsafeRender) {
    const renderFn = templateResource.createUnsafeRenderFunction();
    return generateOutput(renderFn(templateVariableContext), options);
  }
  const renderFn = templateResource.createRenderFunction();
  const renderResult = renderFn(templateVariableContext.resolveValues());
  if (!renderResult.isOk()) {
    return renderResult;
  }
  return generateOutput(renderResult.value, options);
};
