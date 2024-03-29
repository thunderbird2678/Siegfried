module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "plugin:prettier/recommended",
        "plugin:react/recommended",
        "standard-with-typescript"
    ],
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "prettier",
    ],
    "rules": {
        "prettier/prettier": "error"
    }
}
