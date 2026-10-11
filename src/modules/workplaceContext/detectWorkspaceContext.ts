import path, { dirname } from 'node:path';
import type { CliArgs } from "../optique/cliArgs.js";
import type { File } from '../../validation/schemas/file.js';
import { AbsolutePathSchema, type AbsolutePath } from '../../validation/customTypes/path.js';
import { longestCommonPathPrefix } from '../../utils/path/platform-specific/longestCommonPathPrefix.js';
import { WorkspaceContextSchema } from '../../validation/schemas/workspaceContext.js';
import { errAsync, okAsync } from 'neverthrow';

const getWorkspacePrefixesByWorkflowFile = (workflowFile: File) => {
  let currentPath: AbsolutePath = AbsolutePathSchema.parse(dirname(workflowFile));
  const { root } = path.parse(workflowFile);
  const result: AbsolutePath[] = [];
  while (currentPath !== root) {
    result.push(currentPath);
    currentPath = AbsolutePathSchema.parse(dirname(currentPath));
  }
  return result;
}

const getWorkspacePrefixesByWorkflowAndPresetFiles = (workflowFile: File, workflowPresetFile: File) => {
  const longestCommonPrefix = longestCommonPathPrefix(workflowFile, workflowPresetFile);
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
  currentPath = AbsolutePathSchema.parse(dirname(workflowFile));
  while (!longestCommonPrefix.startsWith(currentPath)) {
    result.push(currentPath);
    currentPath = AbsolutePathSchema.parse(dirname(currentPath));
  }
  return result;
}

// Add configurable option for context detection for dynamic context detection
export const detectWorkspaceContextFromCliInput = async (cliInput: CliArgs['positionalArgs']) => {
  const {
    workflow,
    workflowPreset,
  } = cliInput;
  const orderedPathPrefixes = workflowPreset !== undefined ?
    getWorkspacePrefixesByWorkflowAndPresetFiles(workflow, workflowPreset) :
    getWorkspacePrefixesByWorkflowFile(workflow);
  for (const orderedPathPrefix of orderedPathPrefixes) {
    const parseResult = await WorkspaceContextSchema.safeParseAsync(orderedPathPrefix);
    if (parseResult.success) {
      return okAsync(parseResult.data);
    }
  }
  return errAsync(undefined)
};
