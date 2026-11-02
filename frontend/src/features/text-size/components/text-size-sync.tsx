"use client";

import { useLayoutEffect } from "react";

import { applyTextSize } from "@/features/text-size/text-size";
import { textSize } from "@/features/text-size/use-text-size";

/**
 * Applies changes from any tab, and re-applies after React's dev-only
 * remount clears the <head> script's style. Mounted once, in the root layout.
 */
export function TextSizeSync() {
  useLayoutEffect(() => {
    const sync = () => applyTextSize(textSize.get());
    sync();
    return textSize.subscribe(sync);
  }, []);

  return null;
}
