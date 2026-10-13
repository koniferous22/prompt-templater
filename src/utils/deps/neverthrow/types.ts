import type { AppErrorCode } from "../../../constants/errorCodes.js";
import type { MessageContext } from "../../../constants/errorMessages.js";

export type AppError<C extends AppErrorCode> = {
  readonly type: "plain";
  readonly code: C;
  readonly message: string;
  readonly cause?: unknown;
  readonly meta: MessageContext[C];
};

export type AppErrorInstance<ErrorCodes extends AppErrorCode = AppErrorCode> = {
  [C in ErrorCodes]: AppError<C>;
}[ErrorCodes];

export type AppErrors<ErrorCodes extends AppErrorCode = AppErrorCode> = readonly [
  AppErrorInstance<ErrorCodes>,
  AppErrorInstance<ErrorCodes>,
  ...AppErrorInstance<ErrorCodes>[],
];

export type OptionalAppErrors<ErrorCodes extends AppErrorCode = AppErrorCode> = (
  | AppErrorInstance<ErrorCodes>
  | undefined
)[];

export type AppAggregateErr<
  ErrorCodes extends AppErrorCode = AppErrorCode,
  ErrorTypes extends AppErrors<ErrorCodes> = AppErrors<ErrorCodes>,
> = {
  readonly type: "aggregate";
  errors: ErrorTypes;
};
export interface AppErrOpts {
  cause?: unknown;
  message?: string;
}
