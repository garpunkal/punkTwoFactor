import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '.env') });

const baseURL = process.env.UMBRACO_BASE_URL || 'https://localhost:44384';
const headless = process.env.HEADLESS !== 'false';

export default defineConfig({
  testDir: './specs',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false, // Run 2FA sequence sequentially to maintain user state
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL,
    headless,
    ignoreHTTPSErrors: true, // Handle localhost self-signed HTTPS certificates
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  // Automatically boots UmbracoTestSite if not already running
  webServer: {
    command: 'dotnet run --project ../UmbracoTestSite',
    url: `${baseURL}/umbraco`,
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
