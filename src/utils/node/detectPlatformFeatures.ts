import { match } from "ts-pattern";

type PathFragmentVariant =
  | 'posix'
  | 'win32';

export const pathFragmentVariant = match(process.platform)
  .returnType<PathFragmentVariant>()
  .with('win32', () => 'win32')
  .otherwise(() => 'posix');
