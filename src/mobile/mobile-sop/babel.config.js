module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@database': './src/database',
            '@hooks': './src/hooks',
            '@repositories': './src/repositories',
            '@utils': './src/utils',
            '@app-types': './src/types',
            '@config': './src/config',
          },
        },
      ],
    ],
  };
};