import type z from "zod";

import type { ConfigResourceSchemaByResourceType } from "../../factories/resourceFactories.js";

export const workflowResourceGetReferences = (
  workflow: z.output<ConfigResourceSchemaByResourceType<"workflow">>,
) => {
  const templateReference = workflow.templateFile;
  const termReferences = workflow.steps
    .map((step) => {
      if (step.type !== "checkbox" && step.type !== "select") {
        return null;
      }
      if (step.choices.type !== "reference") {
        return null;
      }
      return step.choices.reference;
    })
    .filter((reference) => reference !== null);
  return {
    template: templateReference,
    terms: termReferences,
  };
};
