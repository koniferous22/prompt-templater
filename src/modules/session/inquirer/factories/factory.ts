import { ok } from "neverthrow";

import type { ConfigResourceReference } from "../../../../validation/resourceReference/config/schemas/configResourceReference.js";
import type { ResourceContext } from "../../../resourceContext/factory/resourceContext.js";
import type { ConfigResourceTypes } from "../../../resources/config/factories/resourceFactories.js";
import { inquirerSessionGenerateOutput } from "../methods/generateOutput.js";
import { createInquirerSessionRunStep } from "../methods/runSingleStep.js";

// TODO - eventual improvement to this method - compose flow from multiple workflows that call each other
const resolveStepsQueue = (workflow: ConfigResourceTypes["workflow"]) => {
  return workflow.getWorkflowData().steps;
};

export const inquirerSessionFactory = (
  resourceContext: ResourceContext,
  entrypointWorkflowRef: ConfigResourceReference,
  options: {
    skipTemplateValidation: boolean;
    unsafeRender: boolean;
    shouldPrintToStdout: boolean;
    shouldCopyToClipboard: boolean;
  },
) => {
  const resolveEntrypointWorkflowResult = resourceContext.loadWorkflow(entrypointWorkflowRef);
  if (!resolveEntrypointWorkflowResult.isOk()) {
    return resolveEntrypointWorkflowResult;
  }
  const entrypointWorkflow = resolveEntrypointWorkflowResult.value;
  const { template: templateReference } = entrypointWorkflow.resource.getReferences();
  const resolveTemplateResult = resourceContext.loadTemplate(templateReference.reference);
  if (!resolveTemplateResult.isOk()) {
    return resolveTemplateResult;
  }
  const template = resolveTemplateResult.value.template;
  const templateVariableContext = entrypointWorkflow.resource
    .getTemplateVariableSpecs()
    .createTemplateVariableContext();
  const stepsQueue = resolveStepsQueue(entrypointWorkflow.resource);
  if (!options.skipTemplateValidation) {
    const validateInputShapeResult = template.validateInputShape();
    if (!validateInputShapeResult.isOk()) {
      return validateInputShapeResult;
    }
  }
  const runSingleStep = createInquirerSessionRunStep(resourceContext, templateVariableContext);
  const inquirerSession = {
    generateOutput: () => {
      return inquirerSessionGenerateOutput(
        resolveTemplateResult.value.template,
        templateVariableContext,
        options,
      );
    },
    getSessionState: () => templateVariableContext,
    runStep: runSingleStep,
    runSteps: async () => {
      // consumes the entire steps queue
      for (const step of stepsQueue) {
        const stepResult = await runSingleStep(step);
        if (!stepResult.isOk()) {
          return stepResult;
        }
      }
      return ok(undefined);
    },
    run: async () => {
      // consumes the entire steps queue
      for (const step of stepsQueue) {
        const stepResult = await runSingleStep(step);
        if (!stepResult.isOk()) {
          return stepResult;
        }
      }
      return inquirerSessionGenerateOutput(
        resolveTemplateResult.value.template,
        templateVariableContext,
        options,
      );
    },
  };
  return ok(inquirerSession);
};
