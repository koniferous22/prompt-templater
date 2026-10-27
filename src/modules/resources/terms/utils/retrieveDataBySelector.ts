import { ok } from "neverthrow";

import { appErr } from "../../../../utils/deps/neverthrow/errorFactory.js";
import { NonNegativeIntegerSchema } from "../../../../validation/number/customTypes/number.js";
import type { AbsolutePath } from "../../../../validation/path/customTypes/index.js";
import type { Selector } from "../../../../validation/resourceReference/term/schemas/selector.js";
import { NonEmptyStringSchema } from "../../../../validation/string/customTypes/string.js";

export const retrieveTermDataBySelector = (
  data: unknown,
  selector: Selector,
  context: { file: AbsolutePath },
) => {
  let current: unknown = data;
  for (
    let selectorSegmentIndex = 0;
    selectorSegmentIndex < selector.length;
    selectorSegmentIndex++
  ) {
    const selectorSegment = selector[selectorSegmentIndex];
    if (NonEmptyStringSchema.validate(selectorSegment)) {
      if (typeof current !== "object") {
        return appErr("module_resources_term_utils_retrieveTermDataBySelector_invalidPath", {
          file: context.file,
          selector,
          faillingSegment: selectorSegment,
          faillingSegmentIndex: selectorSegmentIndex,
          expected: "object",
          actual: typeof current,
        });
      }
      if (Array.isArray(current)) {
        return appErr("module_resources_term_utils_retrieveTermDataBySelector_invalidPath", {
          file: context.file,
          selector,
          faillingSegment: selectorSegment,
          faillingSegmentIndex: selectorSegmentIndex,
          expected: "object",
          actual: "array",
        });
      }
      if (current === null) {
        return appErr("module_resources_term_utils_retrieveTermDataBySelector_invalidPath", {
          file: context.file,
          selector,
          faillingSegment: selectorSegment,
          faillingSegmentIndex: selectorSegmentIndex,
          expected: "object",
          // typeof null === 'object' :D
          actual: "null",
        });
      }
      if (!(selectorSegment in current)) {
        return appErr(
          "module_resources_term_utils_retrieveTermDataBySelector_keyNotFoundInObject",
          {
            file: context.file,
            selector,
            faillingSegment: selectorSegment,
            faillingSegmentIndex: selectorSegmentIndex,
          },
        );
      }
      current = (current as any)[selectorSegment];
      continue;
    }
    if (NonNegativeIntegerSchema.validate(selectorSegment)) {
      if (!Array.isArray(current)) {
        return appErr("module_resources_term_utils_retrieveTermDataBySelector_invalidPath", {
          file: context.file,
          selector,
          faillingSegment: selectorSegment,
          faillingSegmentIndex: selectorSegmentIndex,
          expected: "object",
          actual: current === null ? "null" : typeof current,
        });
      }
      if (selectorSegment >= current.length) {
        return appErr(
          "module_resources_term_utils_retrieveTermDataBySelector_arrayIndexOutOfRange",
          {
            file: context.file,
            selector,
            faillingSegment: selectorSegment,
            faillingSegmentIndex: selectorSegmentIndex,
          },
        );
      }
      // TODO  check array in dex out of range
      current = current[selectorSegment];
      continue;
    }
  }
  return ok(current);
};
