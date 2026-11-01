import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The shadcn CLI writes `import { cn } from "cn"` in new components.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "cn",
              message:
                'Import cn from "@/lib/utils", which knows the text roles in globals.css.',
            },
          ],
        },
      ],
    },
  },
  {
    // Outside shadcn's components, text is sized by role (see globals.css).
    files: ["src/**/*.tsx"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(^|\\s)([^\\s:]+:)*text-(xs|sm|base|lg|[2-9]?xl)(\\s|$)/]",
          message:
            "Size text with a role from globals.css: text-title, text-heading, text-body or text-caption.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
