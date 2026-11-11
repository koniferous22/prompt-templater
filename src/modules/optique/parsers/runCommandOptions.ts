import { object, option } from "@optique/core";

export const runCommandOptionsParser = object({
  skipTemplateValidation: option("--skip-template-validation"),
  unsafeRender: option("-u", "--unsafe-render"),
  shouldPrintToStdout: option("-p", "--print"),
  shouldCopyToClipboard: option("-c", "--copy").withDefault(true),
});
