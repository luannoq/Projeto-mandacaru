// Configuração de lint do Akaru (ESLint flat config).
// Estende o preset oficial do Expo e desliga regras que conflitam com o Prettier.
// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['node_modules/*', '.expo/*', 'dist/*', 'constants/commit.json'],
  },
];
