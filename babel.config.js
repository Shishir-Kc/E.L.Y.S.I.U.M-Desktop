module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
    'module:metro-react-native-babel-preset'
  ],
  plugins: [
    ['babel-plugin-module-resolver', {
      root: ['./'],
      alias: {
        '@': './src',
        '@config': './src/config',
        '@types': './src/types',
        '@utils': './src/utils',
        '@store': './src/store',
        '@audio': './src/audio',
        '@components': './src/components',
        '@screens': './src/screens',
        '@navigation': './src/navigation'
      }
    }],
    'babel-plugin-react-native-web'
  ]
};
