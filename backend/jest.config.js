module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testTimeout: 30000,
  globals: { 'ts-jest': { tsconfig: { rootDir: '.' } } },
};
