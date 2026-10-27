import z from "zod";

import {
  createTermFromArrayInputByTermTypeCodec,
  createTermFromRecordInputByTermTypeCodec,
} from "../factories/termByTermType.js";

export const BooleanTermFromBooleanArraySchema = createTermFromArrayInputByTermTypeCodec("boolean");
export const NumericTermFromNumericArraySchema = createTermFromArrayInputByTermTypeCodec("number");
export const StringTermFromStringArraySchema = createTermFromArrayInputByTermTypeCodec("string");

export const BooleanTermFromBooleanRecordSchema =
  createTermFromRecordInputByTermTypeCodec("boolean");
export const NumericTermFromNumericRecordSchema =
  createTermFromRecordInputByTermTypeCodec("number");
export const StringTermFromStringRecordSchema = createTermFromRecordInputByTermTypeCodec("string");
