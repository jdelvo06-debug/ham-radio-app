import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Capacitor / PWA assets. These are build artifacts, not source.
    "ios/App/App/public/**",
    "public/sw.js",
    "public/workbox-*.js",
  ]),
  {
    rules: {
      // This app intentionally hydrates localStorage-backed state from effects.
      // Treating that legacy pattern as a release-blocking error creates noise
      // without improving the App Store build.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
