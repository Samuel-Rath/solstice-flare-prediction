const { defineConfig } = require('@playwright/test');
const path = require('path');

const filePath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  use: {
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  // Export the file path for tests to use
  _filePath: filePath,
});
