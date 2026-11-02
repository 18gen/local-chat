import { createCn } from "cn/config";

/**
 * cn that knows the text roles in globals.css: the package's default takes
 * them for colors, dropping a component's own color. Every file, ui included,
 * imports cn from here.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["title", "heading", "body", "caption"] }],
    },
  },
});
