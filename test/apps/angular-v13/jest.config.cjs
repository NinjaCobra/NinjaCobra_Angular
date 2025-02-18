module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|rxjs|@ninja/ninja-auth-js|jsonpath-plus|@ninja/ninja-angular)'
  ],
  testMatch: [
    '**/*.spec.{js,ts}'
  ],
};