/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "<rootDir>/test/bootstrap/setup.ts",
  globalTeardown: "<rootDir>/test/bootstrap/teardown.ts",
};
