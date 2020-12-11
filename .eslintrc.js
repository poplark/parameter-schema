module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    // ...
    '@typescript-eslint',
    // 'react',
    // 'react-hooks',
    'prettier',
  ],
  rules: {
    // ...
    '@typescript-eslint/no-explicit-any': ['off'],
    'prettier/prettier': ['error'],
    // 'react-hooks/rules-of-hooks': 'error', // 检查 Hook 的规则
    // 'react-hooks/exhaustive-deps': 'warn', // 检查 effect 的依赖
    // 'react/jsx-uses-react': 'warn',
    // 'react/jsx-uses-vars': 'warn',
  },
};
