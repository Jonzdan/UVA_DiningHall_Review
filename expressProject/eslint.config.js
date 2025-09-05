// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  { ignores: ["node_modules", "dist", "eslint.config.*"] },

  {
    files: ["**/*.{js,cjs,mjs}"],
    extends: [js.configs.recommended],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier,
    },
    rules: {
      "prettier/prettier": ["error", { tabWidth: 4}],
      "@typescript-eslint/indent": ["error", 4],
      "sort-imports": ["error"]
    }
  },
  prettierConfig,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  tseslint.configs.recommendedTypeChecked
]);
