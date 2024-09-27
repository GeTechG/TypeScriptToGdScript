const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylistic,
    {
        rules: {
            "@typescript-eslint/no-empty-function": "off",
        }
    }
];
