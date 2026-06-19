module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/blackbox", "<rootDir>/integration"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  testRegex: ".*\\.test\\.js$",
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  moduleDirectories: [
    "node_modules",
    "<rootDir>/../node_modules",
    "<rootDir>/../Backend/node_modules",
  ],
};
