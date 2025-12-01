// ESLint configuration
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'next/core-web-vitals',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
