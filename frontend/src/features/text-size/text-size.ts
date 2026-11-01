/**
 * The text size setting. Every size in the app is in rem, so scaling the
 * root font size enlarges text, buttons, icons and spacing together, like
 * zoom. It is a percentage, so it adds to the browser's own font size.
 *
 * To add or tune a size, change this list; its label lives in the locale
 * (`settings.textSizes`), which TypeScript keeps in step.
 */
export const TEXT_SIZES = {
  sm: 0.875,
  md: 1,
  lg: 1.25,
} as const;

export type TextSize = keyof typeof TEXT_SIZES;

export const DEFAULT_TEXT_SIZE: TextSize = "md";

// A display preference, like starred workflows: never patient data or chat
// content.
export const TEXT_SIZE_STORAGE_KEY = "local-chat:text-size";

export function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && Object.hasOwn(TEXT_SIZES, value);
}

/** The saved size, or null if none is saved or storage is blocked. */
export function readSavedTextSize(): TextSize | null {
  try {
    const value = localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    return isTextSize(value) ? value : null;
  } catch {
    return null;
  }
}

export function applyTextSize(size: TextSize) {
  document.documentElement.style.fontSize = `${TEXT_SIZES[size] * 100}%`;
}

/**
 * Applies the saved size from <head>, before the first paint, so a page
 * never shows at the default size first. From the Next.js guide "Preventing
 * flash before hydration".
 */
export const TEXT_SIZE_SCRIPT = `(function(){try{var s=${JSON.stringify(TEXT_SIZES)}[localStorage.getItem(${JSON.stringify(TEXT_SIZE_STORAGE_KEY)})];if(typeof s==="number")document.documentElement.style.fontSize=s*100+"%"}catch(e){}})()`;
