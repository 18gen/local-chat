"use client";

import { useLayoutEffect } from "react";

import { applyTextSize } from "@/features/text-size/text-size";
import { textSize } from "@/features/text-size/use-text-size";

/**
 * Keeps the page at the chosen text size once React takes over from the
 * <head> script: applies a new choice from this tab or another one, and
 * re-applies after React's development-only remount clears the script's
 * style from <html> (a no-op in production). Mounted once, in the root layout.
 */
export function TextSizeSync() {
  useLayoutEffect(() => {
    const sync = () => applyTextSize(textSize.get());
    sync();
    return textSize.subscribe(sync);
  }, []);

  return null;
}
