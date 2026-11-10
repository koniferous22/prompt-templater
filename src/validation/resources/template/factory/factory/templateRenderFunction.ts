import z from "zod";

export const createTemplateRenderFunctionSchema = <InputSchema extends z.ZodObject>(
  input: z.ZodObject,
) => {
  return z.function({
    input: [input],
    output: z.string(),
  });
};
