import type { Selector } from "../../../../validation/resourceReference/term/schemas/selector.js";
import type { AppError } from "../../utils/deps/neverthrow/types.js";
import type { NonEmptyString } from "../../validation/string/customTypes/string.ts";

export interface Template {
  validateExpectedVariableSpecs(): Result<undefined, AppError>;
  getCompiledTemplate(): (arg: any) => string;
}
