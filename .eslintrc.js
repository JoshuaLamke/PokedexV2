module.exports = {
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'jest', 'import'],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    extraFileExtensions: [".scss"]
  },
  rules: {
    "@typescript-eslint/quotes": [
      "error",
      "double",
      {
        "allowTemplateLiterals": true
      }
    ],
    "@typescript-eslint/comma-dangle": [
      "off"
    ],
    "@typescript-eslint/indent": ["off"],
  },
};