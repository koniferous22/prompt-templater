export const TemplateEngine = {
  Handlebars: "handlebars",
} as const;

export type TemplateEngineType = (typeof TemplateEngine)[keyof typeof TemplateEngine];
