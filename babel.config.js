module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // No Reanimated 4 o plugin passou a vir do react-native-worklets.
    // Precisa ser SEMPRE o último da lista.
    plugins: ['react-native-worklets/plugin'],
  };
};
