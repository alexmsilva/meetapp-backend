module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: ['eslint:recommended', 'prettier'],
    plugins: ['prettier'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        'prettier/prettier': 'error',
        'no-trailing-spaces': 'error',
        'eol-last': ['error', 'always'],
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
        'class-methods-use-this': 'off',
        'no-param-reassign': 'off',
        'camelcase': 'off',
        'no-unused-vars': ['error', { 'argsIgnorePattern': 'next' }],
        'require-atomic-updates': 'off'
    }
};
