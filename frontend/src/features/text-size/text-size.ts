/**
 * Sizes are in rem, so scaling the root font enlarges the whole UI like zoom.
 * A percentage, so it adds to the browser's own setting.
 */
export const TEXT_SIZES = {
  sm: 0.875,
  md: 1,
  lg: 1.25,
} as const;

export type TextSize = keyof typeof TEXT_SIZES;

export const DEFAULT_TEXT_SIZE: TextSize = "md";

export const TEXT_SIZE_STORAGE_KEY = "local-chat:text-size";

export function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && Object.hasOwn(TEXT_SIZES, value);
}

export function applyTextSize(size: TextSize) {
  document.documentElement.style.fontSize = `${TEXT_SIZES[size] * 100}%`;
}

/**
 * Applies the saved size before the first paint (Next.js guide "Preventing
 * flash before hydration").
 */
export const TEXT_SIZE_SCRIPT = `(function(){try{var s=${JSON.stringify(TEXT_SIZES)}[localStorage.getItem(${JSON.stringify(TEXT_SIZE_STORAGE_KEY)})];if(typeof s==="number")document.documentElement.style.fontSize=s*100+"%"}catch(e){}})()`;
