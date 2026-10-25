import { z, type ZodError } from "zod";

import type { NonEmptyArray } from "../utils/array/isNonEmptyArray.js";
import type { DirentFlags } from "../validation/fs/schemas/dirent.js";
import type { AbsolutePath, RelativePath } from "../validation/path/customTypes/index.js";
import type { AppErrorCode } from "./errorCodes.js";

const countDigits = (n: number) => Math.floor(Math.log10(n)) + 1;

const formatTextLines = (
  lines: string[],
  startingLineNumber: number,
  options: { truncatedLength: number; lineCount: number } = { truncatedLength: 50, lineCount: 3 },
) => {
  const digitCount = countDigits(startingLineNumber + lines.length - 1);
  const formatTextLine = (line: string, lineNumber: number) =>
    line.length > options.truncatedLength
      ? `${lineNumber} > ${line.slice(0, options.truncatedLength)}...`
      : line;
  const [first, ...rest] = lines;
  if (!first) {
    return "";
  }
  if (rest.length === 0) {
    return `\`${formatTextLine(first, startingLineNumber)}\``;
  }
  const formattedLines = lines
    .slice(0, options.lineCount)
    .map((line, index) => formatTextLine(line, startingLineNumber + index));
  if (lines.length > options.lineCount) {
    formattedLines.push("...");
  }
  return `\`\`\`\n${formattedLines.join("\n")}\n\`\`\``;
};

const createFormatItemList =
  <T>(renderItem: (item: T) => string) =>
  (items: [T, ...T[]], truncatedLength: number | null = 2): string => {
    const shouldTruncate = truncatedLength !== null && items.length > truncatedLength;
    const displayedItems = shouldTruncate
      ? [...items.slice(0, 2).map(renderItem), "..."]
      : items.map(renderItem);
    return displayedItems.join(", ");
  };

const formatStringList = createFormatItemList<string>((x: string) => x);

// TODO - often encountering circular references, because zod issue formatting reuses `errorMessages` as well

export const errorMessages = {
  dependency_nodeFs_fsCreateReadStream_unableToOpenForReading: (ctx: {
    value: string;
    errorMessage: string;
  }) => `Error reading file ${ctx.value} - received error "${ctx.errorMessage}"`,
  dependency_nodeFs_fsReadDir_invalidOuptutShape: () =>
    'unexpected output of fs.readdir from node:fs, expected array of "Dirent" class',
  dependency_nodeFs_fsReadDir_operationFailed: (ctx: {
    rootFolder: string;
    errorMessage: string;
  }) =>
    `fs.listDir operation failed on root folder "${ctx.rootFolder}" with message "${ctx.errorMessage}"`,
  dependency_nodeFs_fsStat_invalidOutputShape: () =>
    'unexpected output of fs.stat from node:fs, expected "Stats" class',
  dependency_nodeFs_fsStat_operationFailed: (ctx: { value: string; errorMessage: string }) =>
    `fs.stat operation failed on entry "${ctx.value}" with message "${ctx.errorMessage}"`,
  dependency_zod_awaitingAsyncDecode: (ctx: { errorMessage?: string }) =>
    `Encountered error when awaiting asynchronous zod parsing - ${ctx.errorMessage}`,
  dependency_zod_safeParseErrorWithoutIssues: () =>
    `Encountered "zod" error with no attached issues`,
  dependency_zod_validationError: (ctx: { zodError: ZodError<any> }) =>
    `Encountered "zod" validation error\n${z.prettifyError(ctx.zodError)}`,
  entrypoint_cli_unableToDetectContext: (ctx: { workflowFileInput: string }) =>
    `Unable to detect workspace context from workflow file "${ctx.workflowFileInput}"`,
  module_deferredInputContext_rejectedValue: () => "Error detecting workspace context",
  module_detectWorkspaceContext_noContextFound: (ctx: {
    workflowFile: AbsolutePath;
    workflowPresetFile?: AbsolutePath | undefined;
  }) =>
    `Unable to detect context from input workflow file "${ctx.workflowFile}"${ctx.workflowPresetFile !== undefined ? ` and workflow preset file "${ctx.workflowPresetFile}"` : ""}`,
  module_direntFlagsMatcher_createDirentFlagsMapFailed: () =>
    "Error creating data structure for validating FS shape",
  module_direntFlagsMatcher_extraItemsFound: (ctx: {
    expectedFolderPath: AbsolutePath;
    extraItem: AbsolutePath;
  }) => `Encountered unmatched entry "${ctx.extraItem}", located in "${ctx.expectedFolderPath}"`,
  module_direntFlagsMatcher_extraItemsFromWrongFolderFound: (ctx: {
    expectedFolderPath: AbsolutePath;
    extraItems: [string, ...string[]];
  }) =>
    `Encountered unmatched entries from expected folder path "${ctx.expectedFolderPath}" - ${formatStringList(ctx.extraItems)}`,
  module_direntFlagsMatcher_patternNotFound: (ctx: {
    pattern: RelativePath;
    parentPath: AbsolutePath;
  }) => `Expected "${ctx.pattern}" to be located in folder "${ctx.parentPath}"`,
  module_direntFlagsMatcher_unmatchedDirentFlag: (ctx: {
    direntFlag: keyof DirentFlags;
    expected: boolean;
    actual: boolean;
    path: AbsolutePath;
  }) =>
    `Encountered incorrect dirent flag "${ctx.direntFlag}" for "${ctx.path}"; expected - "${ctx.expected}", actual - "${ctx.actual}"`,
  module_resourceContext_createResourceContextFromDeferredWorkspaceContext_invalidWorkflowPath:
    (ctx: { workflowFileInput: string }) =>
      `Received invalid workflow file "${ctx.workflowFileInput}" from user input`,
  module_resources_config_resourceFileFromAbsolutePath_invalidInput: (ctx: { value: string }) =>
    `Expected config resource path ${ctx.value} for user input`,
  module_resources_config_resourceFileFromReference_invalidInput: (ctx: { value: string }) =>
    `Expected config resource path ${ctx.value} for user input`,
  module_resources_config_resourceFileFromReference_invalidInputJsonRelativePath: (ctx: {
    value: string;
  }) => `Encountered invalid .json relative path ${ctx.value} from user input`,
  module_resources_config_resourceFileFromReference_invalidInputYamlRelativePath: (ctx: {
    value: string;
  }) => `Encountered invalid .yaml relative path ${ctx.value} from user input`,
  module_resources_config_resourceFromResourceFile_errorReadingFile: (ctx: { value: string }) =>
    `Error reading file "${ctx.value}"`,
  module_resources_config_resourceFromResourceFile_invalidJsonContents: (ctx: { file: string }) =>
    `File "${ctx.file}" contains invalid JSON contents`,
  module_resources_config_resourceFromResourceFile_invalidStructure: (ctx: {
    file: string;
    zodError: ZodError<any>;
  }) => `File "${ctx.file}" contains invalid data\n${z.prettifyError(ctx.zodError)}`,
  module_resources_config_resourceFromResourceFile_invalidYamlContents: (ctx: { file: string }) =>
    `File "${ctx.file}" contains invalid YAML contents`,
  module_resources_template_resourceFileFromReference_invalidInput: (ctx: { value: string }) =>
    `Expected template resource path ${ctx.value} for user input`,
  module_resources_template_resourceFileFromReference_invalidInputHandlebarsRelativePath: (ctx: {
    value: string;
  }) => `Encountered invalid .hbs relative path ${ctx.value} from user input`,
  module_resources_template_resourceFromResourceFile_errorReadingFile: (ctx: { value: string }) =>
    `Error reading file "${ctx.value}"`,
  module_resources_template_resourceFromResourceFile_invalidHandlebarsContents: (ctx: {
    file: string;
  }) => `File "${ctx.file}" contains invalid handlebars template contents`,
  module_resources_term_resourceFileFromReference_invalidInput: (ctx: { value: string }) =>
    `Expected term resource path ${ctx.value} for user input`,
  module_resources_term_resourceFileFromReference_invalidInputJsonRelativePath: (ctx: {
    value: string;
  }) => `Encountered invalid .json relative path ${ctx.value} from user input`,
  module_resources_term_resourceFileFromReference_invalidInputPlaintextRelativePath: (ctx: {
    value: string;
  }) => `Encountered invalid relative path ${ctx.value} from user input`,
  module_resources_term_resourceFileFromReference_invalidInputYamlRelativePath: (ctx: {
    value: string;
  }) => `Encountered invalid .yaml relative path ${ctx.value} from user input`,
  module_resources_term_plaintextTermFileParser_parsedWhitespaceLines: (ctx: {
    lines: string[];
    startingLineNumber: number;
    filepath: string;
  }) => {
    const shouldUseEmptyAdjective = ctx.lines.every((line) => line === "");
    const shouldUsePlural = ctx.lines.length > 1;
    return `File "${ctx.filepath}" contains ${shouldUseEmptyAdjective ? "empty" : "whitespace"} ${shouldUsePlural ? "lines starting with line" : "line"} ${ctx.startingLineNumber}\n\`${formatTextLines(ctx.lines, ctx.startingLineNumber)}\``;
  },
  validation_fs_codecs_absolutePathToFsStats_invalidInputData: (ctx: { zodError: ZodError<any> }) =>
    `Encountered "zod" validation error\n${z.prettifyError(ctx.zodError)}`,
  validation_fs_schemas_direntSchema_invalidInputFormat: (ctx: { zodError: ZodError<any> }) =>
    `Encountered "zod" validation error\n${z.prettifyError(ctx.zodError)}`,
  validation_fs_schemas_fileSchema_pathIsNotFolder: (ctx: { value: string }) =>
    `Expected file for input "${ctx.value}"`,
  validation_fs_schemas_folderSchema_pathIsNotFolder: (ctx: { value: string }) =>
    `Expected folder for input "${ctx.value}"`,
  validation_number_customTypes_nonNegativeInteger_invalidInput: (ctx: { value: string }) =>
    `Expected non-negative integer got "${ctx.value}"`,
  validation_path_customTypes_fileExtension_invalidInput: (ctx: { value: string }) =>
    `Expected file extension got "${ctx.value}"`,
  validation_path_customTypes_posix_absolutePath_invalidInputFormat: (ctx: { value: string }) =>
    `Expected POSIX absolute path, got "${ctx.value}"`,
  validation_path_customTypes_posix_pathFragment_emptyInput: () =>
    'Expected POSIX path fragment, got ""',
  validation_path_customTypes_posix_pathFragment_invalidInputFormat: (ctx: { value: string }) =>
    `Expected POSIX path fragment (no '/' characters), got "${ctx.value}"`,
  validation_path_customTypes_posix_relativePath_emptyInput: () =>
    'Expected POSIX relative path, got ""',
  validation_path_customTypes_posix_relativePath_invalidInputFormat: (ctx: { value: string }) =>
    `Expected POSIX relative path, got "${ctx.value}"`,
  validation_path_customTypes_win32_absolutePath_invalidInputFormat: (ctx: { value: string }) =>
    `Expected Win32 absolute path (no '/' or '\\' characters), got "${ctx.value}"`,
  validation_path_customTypes_win32_pathFragment_emptyInput: () =>
    'Expected Win32 path fragment, got ""',
  validation_path_customTypes_win32_pathFragment_invalidInputFormat: (ctx: { value: string }) =>
    `Expected Win32 path fragment (no '/' or '\\' characters), got "${ctx.value}"`,
  validation_path_customTypes_win32_relativePath_emptyInput: () =>
    'Expected Win32 relative path, got ""',
  validation_path_customTypes_win32_relativePath_invalidInputFormat: (ctx: { value: string }) =>
    `Expected Win32 relative path, got "${ctx.value}"`,
  validation_path_factories_absolutePathWithExtension_invalidExtension: (ctx: {
    expectedExtensions: NonEmptyArray<string>;
    file: AbsolutePath;
  }) =>
    `Expected ${ctx.expectedExtensions.length === 1 ? `extension "${ctx.expectedExtensions[0]}"` : `one of following extensions: ${formatStringList(ctx.expectedExtensions, null)}`} for file "${ctx.file}"`,
  validation_path_factories_relativePathWithExtension_invalidExtension: (ctx: {
    expectedExtensions: NonEmptyArray<string>;
    file: RelativePath;
  }) =>
    `Expected ${ctx.expectedExtensions.length === 1 ? `extension "${ctx.expectedExtensions[0]}"` : `one of following extensions: ${formatStringList(ctx.expectedExtensions, null)}`} for file "${ctx.file}"`,
  validation_resourceFile_config_codecs_resourceAbsolutePathToResourceFile_invalidJsonFile: (ctx: {
    value: string;
  }) => `Path "${ctx.value}" doesn't point to valid JSON file`,
  validation_resourceFile_config_codecs_resourceAbsolutePathToResourceFile_invalidJsonPath: (ctx: {
    value: string;
  }) => `Error retrieving absolute path from "${ctx.value}"`,
  validation_resourceFile_config_codecs_resourceAbsolutePathToResourceFile_invalidYamlFile: (ctx: {
    value: string;
  }) => `Path "${ctx.value}" doesn't point to valid YAML file`,
  validation_resourceFile_config_codecs_resourceAbsolutePathToResourceFile_invalidYamlPath: (ctx: {
    value: string;
  }) => `Error retrieving absolute path from "${ctx.value}"`,
  validation_resourceFile_template_codecs_resourceAbsolutePathToResourceFile_invalidHandlebarsFile:
    (ctx: { value: string }) => `Path "${ctx.value}" doesn't point to valid .hbs file`,
  validation_resourceFile_template_codecs_resourceAbsolutePathToResourceFile_invalidHandlebarsPath:
    (ctx: { value: string }) => `Error retrieving absolute path from "${ctx.value}"`,
  validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidJsonFile: (ctx: {
    value: string;
  }) => `Path "${ctx.value}" doesn't point to valid JSON file`,
  validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidJsonPath: (ctx: {
    value: string;
  }) => `Error retrieving absolute path from "${ctx.value}"`,
  validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidJsonSelector:
    (ctx: { value: (string | number)[] | null }) =>
      `Error retrieving selector for JSON file from ${JSON.stringify(ctx.value)}`,
  validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidPlaintextFile:
    (ctx: { value: string }) => `Path "${ctx.value}" doesn't point to valid file`,
  validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidPlaintextPath:
    (ctx: { value: string }) => `Error retrieving absolute path from "${ctx.value}"`,
  validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidYamlFile: (ctx: {
    value: string;
  }) => `Path "${ctx.value}" doesn't point to valid YAML file`,
  validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidYamlPath: (ctx: {
    value: string;
  }) => `Error retrieving absolute path from "${ctx.value}"`,
  validation_resourceFile_term_codecs_resourceAbsolutePathToResourceFile_invalidYamlSelector:
    (ctx: { value: (string | number)[] | null }) =>
      `Error retrieving selector for YAML file from ${JSON.stringify(ctx.value)}`,
  validation_resourceFragments_steps_select_codecs_selectorWorkflowStep_invalidJsonFileFragment:
    (ctx: { selectWorkflowStepId: string; jsonFilePath: string }) =>
      `Select step with id: "${ctx.selectWorkflowStepId}" contains invalid json choices reference with path "${ctx.jsonFilePath}"`,
  validation_resourceFragments_steps_select_codecs_selectorWorkflowStep_invalidPlainFileFragment:
    (ctx: { selectWorkflowStepId: string; plainFilePath: string }) =>
      `Select step with id: "${ctx.selectWorkflowStepId}" contains invalid plaintext choices reference with path "${ctx.plainFilePath}"`,
  validation_resourceFragments_steps_select_codecs_selectorWorkflowStep_invalidYamlFileFragment:
    (ctx: { selectWorkflowStepId: string; yamlFilePath: string }) =>
      `Select step with id: "${ctx.selectWorkflowStepId}" contains invalid yaml choices reference with path "${ctx.yamlFilePath}"`,
  validation_resourceReference_config_codecs_absolutePathToResourceAbsolutePath_invalidExtension:
    (ctx: { resourceInput: AbsolutePath; allowedExtensions: NonEmptyArray<string> }) =>
      `Input value "${ctx.resourceInput}" contains invalid file extension (supported: ${formatStringList(ctx.allowedExtensions, null)})`,
  validation_resourceReference_config_codecs_nonEmptyStringToResourceInput_invalidInputData: (ctx: {
    value: string;
  }) => `Expected absolute or relative path, got "${ctx.value}`,
  validation_resourceReference_config_codecs_relativePathToResourceRelativePath_invalidExtension:
    (ctx: { resourceInput: RelativePath; allowedExtensions: NonEmptyArray<string> }) =>
      `Input value "${ctx.resourceInput}" contains invalid file extension (supported: ${formatStringList(ctx.allowedExtensions, null)})`,
  validation_resourceReference_template_codecs_absolutePathToResourceAbsolutePath_invalidExtension:
    (ctx: { resourceInput: AbsolutePath; allowedExtensions: NonEmptyArray<string> }) =>
      `Input value "${ctx.resourceInput}" contains invalid file extension (supported: ${formatStringList(ctx.allowedExtensions, null)})`,
  validation_resourceReference_template_codecs_nonEmptyStringToResourceInput_invalidInputData:
    (ctx: { value: string }) => `Expected absolute or relative path, got "${ctx.value}`,
  validation_resourceReference_template_codecs_relativePathToResourceRelativePath_invalidExtension:
    (ctx: { resourceInput: RelativePath; allowedExtensions: NonEmptyArray<string> }) =>
      `Input value "${ctx.resourceInput}" contains invalid file extension (supported: ${formatStringList(ctx.allowedExtensions, null)})`,
  validation_resourceReference_term_codecs_nonEmptyStringToResourceInput_invalidInputData: (ctx: {
    value: string;
  }) => `Expected absolute or relative path, got "${ctx.value}`,
  validation_string_customTypes_nonEmptyString_invalidInput: (ctx: { value: string }) =>
    `Expected non-empty string got "${ctx.value}"`,
} as const satisfies Record<AppErrorCode, (ctx: any) => string>;

export type MessageContext = {
  [K in AppErrorCode]: Parameters<(typeof errorMessages)[K]>[0];
};
