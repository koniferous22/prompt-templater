import { expectTypeOf } from "expect-type";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppErrorFromOptionalAppErrors } from "./generics.js";
import type { AppAggregateErr, AppError, AppErrorInstance } from "./types.js";

type Test1Input = [
  undefined,
  AppError<"dependency_nodeFs_fsReadDir_invalidOuptutShape">,
  undefined,
  AppError<"dependency_nodeFs_fsReadDir_operationFailed">,
];
type Test2Input = [
  undefined,
  AppError<"dependency_nodeFs_fsReadDir_invalidOuptutShape">,
  undefined,
];
type Test3Input = [undefined, undefined];

type Test1Result = AppErrorFromOptionalAppErrors<AppErrorCode, Test1Input>;
type Test2Result = AppErrorFromOptionalAppErrors<AppErrorCode, Test2Input>;
type Test3Result = AppErrorFromOptionalAppErrors<AppErrorCode, Test3Input>;

expectTypeOf<Test1Result>().toEqualTypeOf<
  AppAggregateErr<
    AppErrorCode,
    [
      AppError<"dependency_nodeFs_fsReadDir_invalidOuptutShape">,
      AppError<"dependency_nodeFs_fsReadDir_operationFailed">,
    ]
  >
>();
expectTypeOf<Test2Result>().toEqualTypeOf<
  AppError<"dependency_nodeFs_fsReadDir_invalidOuptutShape">
>();
expectTypeOf<Test3Result>().toEqualTypeOf<null>();

type GenericTestResult = AppErrorFromOptionalAppErrors;
expectTypeOf<GenericTestResult>().toEqualTypeOf<
  AppErrorInstance<AppErrorCode> | AppAggregateErr<AppErrorCode> | null
>();
