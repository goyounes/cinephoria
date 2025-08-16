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
  ]
}