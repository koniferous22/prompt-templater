import z from "zod";

import { NonEmptyStringSchema } from "../../../../string/customTypes/string.js";

export const AbstractWorkflowStepSchema = z.object({
  id: NonEmptyStringSchema,
  targetVariable: NonEmptyStringSchema.optional(),
});
