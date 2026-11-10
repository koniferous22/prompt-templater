import { ok } from "neverthrow";

import type { ConfigResourceReference } from "../../../../validation/resourceReference/config/schemas/configResourceReference.js";
import type { ResourceContext } from "../../../resourceContext/factory/resourceContext.js";
import type { ConfigResourceTypes } from "../../../resources/config/factories/resourceFactories.js";
import { createInquirerRunStep } from "../methods/runSingleStep.js";

// TODO - eventual improvement to this method - compose flow from multiple workflows that call each other
const resolveStepsQueue = (workflow: ConfigResourceTypes["workflow"]) => {
  return workflow.getWorkflowData().steps;
};

export const inquirerSessionFactory = (
  resourceContext: ResourceContext,
  entrypointWorkflowRef: ConfigResourceReference,
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
  const templateVariableContext = entrypointWorkflow.resource
    .getTemplateVariableSpecs()
    .createTemplateVariableContext();
  const stepsQueue = resolveStepsQueue(entrypointWorkflow.resource);
  // TODO 1 - Invoke validation against constraints from loaded AST - should be template method
  //   * should be invoked by calling - getRenderFunction, that performs the validation
  //     * it accepts Template object spec as input data
  //       * reason - there are 2 methods invoked -
  //         * plain state for handlebars validation
  //         * generated zod schema for compiled function
  //       * I.e. Handlebars AST etc should be template object internal state
  //     * template objects should have 2 exposed methods
  //       * getRenderFunction
  //       * getUnsafeRenderFunction
  // TODO 2 - Initialize steps queue
  //   * add code comment that with nested workflow feature  this will be a flatmap
  //    * create placeholder function, because it will involve more steps, such as cycle detection, I.e. if workflows don't circularly call each other.
  const runSingleStep = createInquirerRunStep(resourceContext, templateVariableContext);
  const inquirerSession = {
    getSessionState: () => templateVariableContext,
    runStep: runSingleStep,
    run: async () => {
      // consumes the entire steps queue
      for (const step of stepsQueue) {
        const stepResult = await runSingleStep(step);
        if (!stepResult.isOk()) {
          return stepResult;
        }
      }
      return ok(undefined);
    },
  };
  return ok(inquirerSession);
};
