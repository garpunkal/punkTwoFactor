import { test, expect } from '@playwright/test';
import { UmbracoBackofficePage } from '../helpers/umbraco';
import { generateTotpCode } from '../helpers/totp';
import { getTestState, clearTestState } from '../helpers/state';

test.describe('punkTwoFactor - Disable Flow', () => {
  test('should allow disabling 2FA with verification code and revert provider status', async ({ page }) => {
    const state = getTestState();
    const backoffice = new UmbracoBackofficePage(page);

    // 1. Log in with username and password
    await backoffice.login({
      username: state.enrolledUsername || process.env.UMBRACO_ADMIN_USERNAME,
    });

    // Check if 2FA challenge is present to complete login
    const validateBtn = page.getByRole('button', { name: 'Validate' });
    if (await validateBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      if (state.totpSecret) {
        const code = generateTotpCode(state.totpSecret);
        const codeInput = page.locator('#mfacode input, input[name="token"], uui-input input').first();
        await codeInput.fill(code);
        await validateBtn.click();
        await page.waitForURL(/.*\/section\/.*/, { timeout: 20_000 }).catch(() => {});
      }
    }

    // 2. Open User Profile -> Configure Two-Factor
    await backoffice.openConfigureTwoFactor();

    // 3. Locate Disable button on the punkTwoFactor provider
    const disableButton = page.locator('button:has-text("Disable"), uui-button:has-text("Disable")').first();
    await expect(disableButton).toBeVisible({ timeout: 15_000 });
    await disableButton.click();

    // 4. Umbraco requires confirming disable with a current TOTP verification code
    const disableCodeInput = page.locator('input[placeholder*="verification code" i], uui-input[placeholder*="verification code" i] input').first();
    await expect(disableCodeInput).toBeVisible({ timeout: 10_000 });

    const disableTotp = generateTotpCode(state.totpSecret!);
    await disableCodeInput.fill(disableTotp);

    const submitDisableBtn = page.getByRole('button', { name: 'Save' })
      .or(page.getByRole('button', { name: 'Submit' }))
      .or(page.locator('uui-button:has-text("Submit")'))
      .last();
    await submitDisableBtn.click();

    // 5. Verify provider returns to "Enable" state
    const enableButton = page.locator('button:has-text("Enable"), uui-button:has-text("Enable")').first();
    await expect(enableButton).toBeVisible({ timeout: 15_000 });

    // Clean up temporary test state
    clearTestState();
  });
});
