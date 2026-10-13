import { expectTypeOf } from "expect-type";

import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { AppErrorFromOptionalAppErrors } from "./generics.js";
import type { AppAggregateErr, AppError, AppErrorInstance, OptionalAppErrors } from "./types.js";

type Test1Input = [
  undefined,
  AppError<"dependency_nodeFs_fsReadDirInvalidOuptutShape">,
  undefined,
  AppError<"dependency_nodeFs_fsReadDirOperationFailed">,
];
type Test2Input = [undefined, AppError<"dependency_nodeFs_fsReadDirInvalidOuptutShape">, undefined];
type Test3Input = [undefined, undefined];

type Test1Result = AppErrorFromOptionalAppErrors<AppErrorCode, Test1Input>;
type Test2Result = AppErrorFromOptionalAppErrors<AppErrorCode, Test2Input>;
type Test3Result = AppErrorFromOptionalAppErrors<AppErrorCode, Test3Input>;

expectTypeOf<Test1Result>().toEqualTypeOf<
  AppAggregateErr<
    AppErrorCode,
    [
      AppError<"dependency_nodeFs_fsReadDirInvalidOuptutShape">,
      AppError<"dependency_nodeFs_fsReadDirOperationFailed">,
    ]
  >
>();
expectTypeOf<Test2Result>().toEqualTypeOf<
  AppError<"dependency_nodeFs_fsReadDirInvalidOuptutShape">
>();
expectTypeOf<Test3Result>().toEqualTypeOf<null>();

type GenericTestResult = AppErrorFromOptionalAppErrors;
expectTypeOf<GenericTestResult>().toEqualTypeOf<AppErrorInstance<AppErrorCode> | AppAggregateErr<AppErrorCode> | null>();
