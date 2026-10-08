import { Page, Locator, expect } from '@playwright/test';

export interface UmbracoCredentials {
  username?: string;
  password?: string;
}

export class UmbracoBackofficePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the Umbraco backoffice login page.
   */
  async goto() {
    await this.page.goto('/umbraco');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Logs in to the Umbraco backoffice.
   */
  async login(creds?: UmbracoCredentials) {
    const username = creds?.username || process.env.UMBRACO_ADMIN_USERNAME || 'admin@example.com';
    const password = creds?.password || process.env.UMBRACO_ADMIN_PASSWORD || 'Password123!';

    await this.goto();

    // Check if already authenticated and at backoffice
    if (this.page.url().includes('/section/') || (await this.page.locator('umb-app-header').isVisible().catch(() => false))) {
      return;
    }

    // Support both standard HTML inputs and Umbraco Lit components (uui-input, etc.)
    const usernameInput = this.page.locator('input[name="username"], uui-input[name="username"] input, input[type="email"], input[autocomplete="username"]').first();
    const passwordInput = this.page.locator('input[name="password"], uui-input-password input, input[type="password"]').first();

    await usernameInput.waitFor({ state: 'visible', timeout: 15_000 });
    await usernameInput.fill(username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    // Click submit button
    const submitBtn = this.page.locator('button[type="submit"], uui-button[type="submit"], button:has-text("Log in"), button:has-text("Sign in")').first();
    await submitBtn.click();

    // Wait for backoffice to finish loading or 2FA challenge to appear
    await Promise.race([
      this.page.waitForURL(/.*\/section\/.*/, { timeout: 20_000 }),
      this.page.locator('input[name="code"], input[placeholder*="code" i]').waitFor({ state: 'visible', timeout: 20_000 }),
    ]).catch(() => {});
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Completes the 2FA challenge during login.
   */
  async submit2FACode(code: string) {
    // Wait for the 2FA code input field on the challenge screen
    const codeInput = this.page.getByPlaceholder(/code from your authenticator/i)
      .or(this.page.getByRole('textbox', { name: /verification code/i }))
      .or(this.page.locator('input[placeholder*="authenticator" i]'))
      .first();
    await codeInput.waitFor({ state: 'visible', timeout: 10_000 });
    await codeInput.fill(code);

    const verifyBtn = this.page.getByRole('button', { name: /Validate|Verify|Submit/i }).first();
    await verifyBtn.click();

    await this.page.waitForURL(/.*\/section\/.*/, { timeout: 20_000 }).catch(() => {});
  }

  /**
   * Opens the user profile menu/workspace from the top header.
   */
  async openUserProfile() {
    // In Umbraco 14-18, the avatar button in the header is "User profile for <User>"
    const avatar = this.page.getByRole('button', { name: /User profile/i })
      .or(this.page.locator('umb-header-app-profile button'))
      .or(this.page.locator('umb-header-app-profile'))
      .first();
    await avatar.waitFor({ state: 'visible', timeout: 20_000 });
    await this.page.waitForTimeout(500);
    await avatar.click();
  }

  /**
   * Opens the Configure Two-Factor dialog/section.
   */
  async openConfigureTwoFactor() {
    await this.openUserProfile();

    // Look for button or menu item "Configure Two-Factor"
    const configure2FABtn = this.page.getByRole('button', { name: /Configure Two-Factor/i })
      .or(this.page.locator('button:has-text("Configure Two-Factor")'))
      .first();
    await configure2FABtn.waitFor({ state: 'visible', timeout: 15_000 });
    await configure2FABtn.click();
  }

  /**
   * Finds the punkTwoFactor provider row/element.
   */
  getTwoFactorProviderCard(providerLabel = 'Two Factor Authentication'): Locator {
    return this.page.locator(`text=${providerLabel}`).locator('xpath=ancestor::*[contains(@class, "provider") or contains(@class, "card") or self::tr or contains(@class, "item") or contains(@class, "row")][1]');
  }
}
