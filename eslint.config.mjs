import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    // R3F scenes mutate three.js objects inside useFrame and build random
    // geometry once in useMemo; the React Compiler purity rules don't apply.
    files: ["components/three/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "assets-src/**", ".playwright-mcp/**"]),
]);

export default eslintConfig;
