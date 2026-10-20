import { DirentObjectToDirentSchema } from "../codecs/direntObjectToDirent.js";

export const DirentFromDirentObjectSchema = DirentObjectToDirentSchema.transform(
  ({ dirent }) => dirent,
);
