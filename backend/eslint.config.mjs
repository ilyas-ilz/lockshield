import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // WHY next-env.d.ts: Next.js generates and rewrites this file itself
    // (on every `next dev`/`next build`) with the exact triple-slash
    // reference syntax our own lint rule flags — it's not ours to fix.
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
