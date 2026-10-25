import type z from "zod";

import type { ConfigResourceSchemaByResourceType } from "../../factories/resourceFactories.js";

export const workflowResourceGetReferences = (
  workflow: z.output<ConfigResourceSchemaByResourceType<"workflow">>,
) => {
  const templateReference = {
    reference: workflow.templateFile,
  };
  const termReferences = workflow.steps
    .map((step) => {
      if (step.type !== "checkbox" && step.type !== "select") {
        return null;
      }
      if (step.choices.type !== "reference") {
        return null;
      }
      return {
        reference: step.choices.reference,
        termType: step.valueType,
      };
    })
    .filter((reference) => reference !== null);
  return {
    template: templateReference,
    terms: termReferences,
  };
};
