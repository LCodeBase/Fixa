const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  // Configuração base do Expo
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Configurações adicionais para melhorar a compatibilidade com react-native-web
  config.resolve.alias = {
    ...config.resolve.alias,
    // Usar react-native-web para componentes nativos
    'react-native$': 'react-native-web',
    // Alias para facilitar importações
    '@components': path.resolve(__dirname, 'src/components'),
    '@screens': path.resolve(__dirname, 'src/screens'),
    '@contexts': path.resolve(__dirname, 'src/contexts'),
    '@config': path.resolve(__dirname, 'src/config'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@assets': path.resolve(__dirname, 'assets'),
  };

  // Configuração para lidar com arquivos específicos de plataforma
  // Ex: Component.web.js será usado na web em vez de Component.js
  config.resolve.extensions = [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    ...config.resolve.extensions,
  ];

  return config;
};