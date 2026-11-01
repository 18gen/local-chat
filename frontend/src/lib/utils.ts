import { createCn } from "cn/config";

/**
 * Joins class names and resolves Tailwind conflicts. It knows the text roles
 * from globals.css (text-title, …); the package's default cn would take them
 * for text colors, dropping a component's own color and keeping its size.
 * Every file imports cn from here, ui components included.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["title", "heading", "body", "caption"] }],
    },
  },
});
