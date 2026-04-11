/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/authRoutes.js',
    'controllers/authController.js',
    'models/userModel.js',
    'middleware/auth.js',
    'middleware/validators.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  maxWorkers: 1
}
