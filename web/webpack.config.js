/**
 * Webpack config for the React Native Web build.
 * Bundles App.web.tsx which renders the same React tree as native.
 */
const path = require('path');

module.exports = (env = {}, argv = {}) => {
  const isProd = argv.mode === 'production';

  return {
    mode: argv.mode || 'development',
    entry: path.resolve(__dirname, '..', 'index.web.js'),
    output: {
      path: path.resolve(__dirname, '..', 'web-build'),
      filename: 'bundle.web.js',
      publicPath: '/',
    },
    devServer: {
      static: { directory: path.resolve(__dirname, '..', 'public') },
      compress: true,
      port: 8080,
      historyApiFallback: true,
      hot: true,
    },
    resolve: {
      extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js', '.json'],
      alias: {
        'react-native$': 'react-native-web',
        '@': path.resolve(__dirname, '..', 'src'),
        '@config': path.resolve(__dirname, '..', 'src/config'),
        '@types': path.resolve(__dirname, '..', 'src/types'),
        '@utils': path.resolve(__dirname, '..', 'src/utils'),
        '@store': path.resolve(__dirname, '..', 'src/store'),
        '@audio': path.resolve(__dirname, '..', 'src/audio'),
        '@components': path.resolve(__dirname, '..', 'src/components'),
        '@screens': path.resolve(__dirname, '..', 'src/screens'),
        '@navigation': path.resolve(__dirname, '..', 'src/navigation'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(m?js)$/,
          resolve: { fullySpecified: false },
          include: /node_modules\/(react-native-vector-icons|react-native-drawer-layout|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-markdown-display)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { browsers: 'last 2 versions' }, loose: true }],
                '@babel/preset-react',
              ],
            },
          },
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: { browsers: 'last 2 versions' },
                  loose: true,
                }],
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                ['@babel/plugin-transform-private-methods', { loose: true }],
                ['@babel/plugin-transform-private-property-in-object', { loose: true }],
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
                    '@navigation': './src/navigation',
                  },
                }],
                'babel-plugin-react-native-web',
              ],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg|woff2?|ttf)$/,
          type: 'asset/resource',
        },
      ],
    },
    devtool: isProd ? false : 'eval-source-map',
    performance: {
      hints: false,
    },
  };
};
