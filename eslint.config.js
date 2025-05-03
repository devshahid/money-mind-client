import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
    { ignores: ["dist", "vite.config.ts", "node_modules", "eslint.config.js"] },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
            },
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
                project: "./tsconfig.json", // Required for some TS-specific rules
            },
        },
        settings: { react: { version: "detect" } }, // Or specify your React version
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "@typescript-eslint": typescriptPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,
            ...typescriptPlugin.configs.recommended.rules,
            ...typescriptPlugin.configs["recommended-type-checked"].rules,
            "react/jsx-no-target-blank": "off",
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "@typescript-eslint/explicit-function-return-type": "warn", // Suggest explicit return types
            "@typescript-eslint/no-unused-vars": "warn", // Warn on unused variables
            // Add other TypeScript-specific rules as needed
        },
    },
];
