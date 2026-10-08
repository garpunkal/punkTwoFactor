import { test, expect } from '@playwright/test';
import { UmbracoBackofficePage } from '../helpers/umbraco';
import { generateTotpCode } from '../helpers/totp';
import { getTestState } from '../helpers/state';

test.describe('punkTwoFactor - Login Verification Flow', () => {
  test('should prompt for 2FA code, reject invalid code, and login with valid TOTP code', async ({ browser }) => {
    const state = getTestState();
    test.skip(!state.totpSecret, 'No enrolled 2FA secret found. Run setup test first.');

    // Create fresh context to ensure no session cookies remain
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const backoffice = new UmbracoBackofficePage(page);

    // 1. Submit username and password
    await backoffice.login({
      username: state.enrolledUsername || process.env.UMBRACO_ADMIN_USERNAME,
    });

    // 2. Verify 2FA challenge screen appears
    const validateBtn = page.getByRole('button', { name: 'Validate' });
    await expect(validateBtn).toBeVisible({ timeout: 15_000 });

    const codeInput = page.locator('#mfacode input, input[name="token"], uui-input input').first();

    // 3. Test Invalid Code Handling
    await codeInput.fill('000000');
    await validateBtn.click();

    // Verify error notification appears or still on challenge screen (login was rejected)
    await page.waitForTimeout(1000);
    const onChallenge = await validateBtn.isVisible();
    expect(onChallenge, 'Invalid code should not bypass 2FA challenge').toBeTruthy();

    // 4. Test Valid Code Submission
    const validCode = generateTotpCode(state.totpSecret!);
    console.log('Submitting valid TOTP code for login:', validCode);
    await codeInput.fill(validCode);
    await validateBtn.click();

    // 5. Verify successful navigation into backoffice dashboard
    const userProfileBtn = page.getByRole('button', { name: /User profile/i });
    await expect(userProfileBtn).toBeVisible({ timeout: 25_000 });

    await context.close();
  });
});
