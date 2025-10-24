// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('@react-native/metro-config').MetroConfig}
//  */
// const config = {};

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const baseConfig = getDefaultConfig(__dirname);

// 👇 Force Metro to use TanStack’s CommonJS build
const customConfig = {
  resolver: {
    ...baseConfig.resolver,
    extraNodeModules: {
      ...baseConfig.resolver.extraNodeModules,
      '@tanstack/query-core': path.resolve(
        __dirname,
        'node_modules/@tanstack/query-core/build/lib',
      ),
    },
  },
};

const config = mergeConfig(baseConfig, customConfig);

// 👇 Keep NativeWind working
module.exports = withNativeWind(config, { input: './global.css' });
