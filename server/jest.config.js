export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: [
    '**/*.test.js'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js',
    '!**/*.test.js'
  ],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/__tests__/utils/testSetup.js']
}