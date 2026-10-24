import { expectTypeOf } from "expect-type";

import { configResourceSchemas, type ConfigResourceSchemaByResourceType } from "./resourceTypes.js";

expectTypeOf(configResourceSchemas.workflow).toEqualTypeOf<ConfigResourceSchemaByResourceType<'workflow'>>();
