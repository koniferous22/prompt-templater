import { expectTypeOf } from "expect-type";

import {
  configResourceSchemas,
  type ConfigResourceSchemaByResourceType,
} from "./resourceFactories.js";

expectTypeOf(configResourceSchemas.workflow).toEqualTypeOf<
  ConfigResourceSchemaByResourceType<"workflow">
>();
