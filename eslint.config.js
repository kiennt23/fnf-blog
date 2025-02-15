import * as tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import reactCompiler from 'eslint-plugin-react-compiler'

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            // The new flat config style uses "parser" as a module object, not just a string.
            parser: tsParser,
            globals: {
                // for a browser environment, if needed
                window: 'readonly',
                document: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                self: 'readonly',
            },
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                // If you need type-aware rules, specify your tsconfig:
                // project: './tsconfig.json',
                project: ['./tsconfig.json', './web-worker/tsconfig.json'],
            },
        },

        // Register plugins
        plugins: {
            // Key = plugin name, Value = imported plugin object
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'jsx-a11y': jsxA11yPlugin,
            prettier: prettierPlugin,
            'react-compiler': reactCompiler,
        },

        // In Flat Config, "rules" merges with what's already set from the base config
        rules: {
            // React recommended
            ...reactPlugin.configs.recommended.rules,

            // React Hooks recommended
            ...reactHooksPlugin.configs.recommended.rules,

            // TypeScript recommended
            ...tsPlugin.configs.recommended.rules,

            // Optionally, override or add your own:
            // e.g. '@typescript-eslint/no-explicit-any': 'off',
            ...jsxA11yPlugin.configs.recommended.rules,
            ...prettierPlugin.configs.recommended.rules,
            ...reactCompiler.configs.recommended.rules,
        },

        settings: {
            react: {
                version: 'detect'
            }
        }
    }
];
