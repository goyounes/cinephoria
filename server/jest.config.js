export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: [
    '**/*.test.js',
    '**/*.test.ts'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    'controllers/**/*.{js,ts}',
    'utils/**/*.{js,ts}',
    'routes/**/*.{js,ts}',
    '!**/*.test.{js,ts}'
  ],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/__tests__/utils/testSetup.ts']
}