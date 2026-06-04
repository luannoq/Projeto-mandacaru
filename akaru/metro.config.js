const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Compatibilidade com o Firebase JS SDK:
// O Metro do SDK 52 habilita "package exports" por padrão, o que quebra a
// resolução de "firebase/auth" (erro "Component auth has not been registered").
// Desabilitamos e garantimos a extensão .cjs.
config.resolver.unstable_enablePackageExports = false;
config.resolver.sourceExts.push('cjs');

module.exports = config;
