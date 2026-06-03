module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // O plugin de worklets precisa ser SEMPRE o último (exigido pelo Reanimated 4).
    plugins: ['react-native-worklets/plugin'],
  };
};
