import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
    ...nextVitals,
    {
        rules: {
            // <img> is intentional for now: image sources include remote demo
            // photos and data URLs uploaded from the static dashboard, which
            // next/image cannot optimise. Turn this back on once images are
            // served from the backend/CDN.
            "@next/next/no-img-element": "off",
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
