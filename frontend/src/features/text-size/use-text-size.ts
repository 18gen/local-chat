import {
  DEFAULT_TEXT_SIZE,
  isTextSize,
  TEXT_SIZE_STORAGE_KEY,
} from "@/features/text-size/text-size";
import { createStoredValue } from "@/lib/stored-value";

// Kept apart from text-size.ts, which the server-rendered root layout imports.
export const textSize = createStoredValue(TEXT_SIZE_STORAGE_KEY, DEFAULT_TEXT_SIZE, (raw) =>
  isTextSize(raw) ? raw : null,
);
