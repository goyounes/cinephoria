export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: [
    '**/*.test.js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js',
    '!**/*.test.js'
  ],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/config/testSetup.js']
}