import z from "zod";

export const createTemplateRenderFunctionSchema = (input: z.ZodObject) => {
  return z.function({
    input: [input],
    output: z.string(),
  });
};
