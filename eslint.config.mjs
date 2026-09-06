import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Apostrophes and quotes are everywhere in English copy and render
      // fine in JSX; only keep the check for the genuinely ambiguous
      // characters that can silently break markup.
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
    },
  },
];

export default eslintConfig;
