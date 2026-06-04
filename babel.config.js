module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // O plugin do Reanimated precisa ser SEMPRE o último.
    plugins: ['react-native-reanimated/plugin'],
  };
};
