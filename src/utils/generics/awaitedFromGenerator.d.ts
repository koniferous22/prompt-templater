export type AwaitedFromGenerator<T> =
  T extends AsyncGenerator<infer Result, any, any> ? Result : never;
