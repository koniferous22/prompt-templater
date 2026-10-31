import path, { dirname } from "node:path";

import { okAsync } from "neverthrow";

import { appErrAsync } from "../../utils/deps/neverthrow/errorFactory.js";
import { longestCommonPathPrefix } from "../../utils/path/platform-specific/index.js";
import { AbsolutePathSchema, type AbsolutePath } from "../../validation/path/customTypes/index.js";
import type { ConfigResourceFile } from "../../validation/resourceFile/config/codecs/resourceAbsolutePathToResourceFile.js";
import { WorkspaceContextSchema } from "../../validation/workspaceContext/schemas/workspaceContext.js";

const getWorkspacePrefixesByWorkflowFile = (workflowFile: ConfigResourceFile) => {
  let currentPath: AbsolutePath = AbsolutePathSchema.parse(dirname(workflowFile.file));
  const { root } = path.parse(workflowFile.file);
  const result: AbsolutePath[] = [];
  while (currentPath !== root) {
    result.push(currentPath);
    currentPath = AbsolutePathSchema.parse(dirname(currentPath));
  }
  return result;
};

const getWorkspacePrefixesByWorkflowAndPresetFiles = (
  workflowFile: ConfigResourceFile,
  workflowPresetFile: ConfigResourceFile,
) => {
  const longestCommonPrefix = longestCommonPathPrefix(workflowFile.file, workflowPresetFile.file);
  if (longestCommonPrefix === null) {
    // If workflow and workflow preset have no common prefix, then consider workflow preset to be outside of workspace
    return getWorkspacePrefixesByWorkflowFile(workflowFile);
  }
  // Part 1 - Append with higher priority path prefixes that are shared between workflow and workflow preset
  let currentPath: AbsolutePath = AbsolutePathSchema.parse(longestCommonPrefix);
  const { root } = path.parse(longestCommonPrefix);
  const result: AbsolutePath[] = [];
  while (currentPath !== root) {
    result.push(currentPath);
    currentPath = AbsolutePathSchema.parse(dirname(currentPath));
  }
  // Part 2 - in case no longest common prefix is matched, try traversing folders specific for workflow file
  // * i.e. consider workflow preset to be external with respect to workspace
  currentPath = AbsolutePathSchema.parse(dirname(workflowFile.file));
  while (!longestCommonPrefix.startsWith(currentPath)) {
    result.push(currentPath);
    currentPath = AbsolutePathSchema.parse(dirname(currentPath));
  }
  return result;
};

// Note - dynamic context detection relies that at very least the input files absolute path has been resolved
export const detectWorkspaceContextFromCliInput = async (cliInput: {
  workflow: ConfigResourceFile;
  workflowPreset?: ConfigResourceFile | undefined;
}) => {
  const { workflow, workflowPreset } = cliInput;
  const orderedPathPrefixes =
    workflowPreset !== undefined
      ? getWorkspacePrefixesByWorkflowAndPresetFiles(workflow, workflowPreset)
      : getWorkspacePrefixesByWorkflowFile(workflow);
  for (const orderedPathPrefix of orderedPathPrefixes) {
    const parseResult = await WorkspaceContextSchema.safeParseAsync(orderedPathPrefix);
    if (parseResult.success) {
      return okAsync(parseResult.data);
    }
  }
  return appErrAsync("module_workspaceContext_detectWorkspaceContextFromCliInput_noContextFound", {
    workflowFile: workflow.file,
    workflowPresetFile: workflowPreset?.file,
  });
};
