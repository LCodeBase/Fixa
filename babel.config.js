module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin para suportar a sintaxe de decoradores
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Plugin para resolver importações de arquivos específicos de plataforma
      // Ex: Component.web.js vs Component.js
      'react-native-web'
    ],
  };
};