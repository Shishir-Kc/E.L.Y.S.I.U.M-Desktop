/**
 * Metro config for React Native + Web.
 * Falls back to a minimal custom web handling via babel-plugin-react-native-web.
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    platforms: ['ios', 'android', 'web', 'native'],
    extraNodeModules: {
      'react-native-web': require.resolve('react-native-web'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
