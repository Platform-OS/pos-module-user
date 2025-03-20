import { defineConfig, devices } from '@playwright/test';
import process from 'process';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/visual-baselines/{testFilePath}/{arg}{ext}',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : 3,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }], // Generates HTML report
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',
    baseURL: process.env.MPKIT_URL,

    screenshot: { mode: 'only-on-failure', fullPage: true },

    viewport: null,

    testIdAttribute: 'data-tc',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /.*\auth.setup\.ts/ },
    { name: 'admin-setup', testMatch: /.*\auth-admin.setup\.ts/ },
    {
      name: 'prepare-env',
      testMatch: /prepare-env\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: false,
    },
    {
      name: 'visual-tests',
      testMatch: /visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        trace: 'retain-on-failure',
      },
      dependencies: ['admin-setup',],
    },
    {
      name: 'alltests',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup',],
      testIgnore: [/prepare-env\.spec\.ts/, /example\.spec\.ts/],
    },
    {
      name: 'test',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup',],
      testIgnore: [/visual\.spec\.ts/, /prepare-env\.spec\.ts/, /example\.spec\.ts/, /admin-panel\.spec\.ts/, /admin-actions\.spec\.ts/, /search\.spec\.ts/, /sort-filter\.spec\.ts/],
    },
    {
      name: 'admin-panel',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['admin-setup',],
      testIgnore: [/^(?!.*admin-panel\.spec\.ts$).*\.spec\.ts$/],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});