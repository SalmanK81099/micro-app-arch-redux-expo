const path = require('node:path');

/**
 * Single source of truth for Jest across the monorepo. Every workspace runs as
 * its own project under the `jest-expo` preset, so tests execute against the
 * same React Native / Expo SDK 57 runtime the apps bundle with.
 *
 * Workspaces do not carry their own Jest config. Their `test` scripts point back
 * here with `--selectProjects <name>`, so a fix like the moduleNameMapper below
 * applies everywhere instead of only to whoever runs from the root.
 */
const workspaces = [
  'apps/mobile',
  'apps/payments',
  'apps/support',
  'packages/core-components',
  'packages/core-navigation',
  'packages/core-store',
  'packages/features-accounts',
  'packages/features-payments',
  'packages/features-support',
];

module.exports = {
  projects: workspaces.map((dir) => ({
    displayName: path.basename(dir),
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
