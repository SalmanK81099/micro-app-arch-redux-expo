const path = require('node:path');

/**
 * Runs every workspace's suite in one pass. Each project uses the `jest-expo`
 * preset so tests execute against the same React Native / Expo SDK 57 runtime
 * the apps bundle with.
 */
const workspaces = [
  'apps/mobile',
  'packages/core-components',
  'packages/core-navigation',
  'packages/core-store',
  'packages/features-payments',
  'packages/features-support',
];

module.exports = {
  projects: workspaces.map((dir) => ({
    displayName: dir.split('/').pop(),
    preset: 'jest-expo',
    rootDir: __dirname,
    roots: [`<rootDir>/${dir}`],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      // immer and react-redux resolve their `react-native` export condition to
      // ESM bundles that Jest cannot parse. Point both at their CJS builds.
      '^immer$': path.join(__dirname, 'node_modules/immer/dist/cjs/index.js'),
      '^react-redux$': path.join(__dirname, 'node_modules/react-redux/dist/cjs/index.js'),
    },
  })),
};
