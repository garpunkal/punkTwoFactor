import { test, expect } from '@playwright/test';
import { UmbracoBackofficePage } from '../helpers/umbraco';
import { generateTotpCode, extractSecretFromOtpAuthUri } from '../helpers/totp';
import { saveTestState } from '../helpers/state';
import jsQR from 'jsqr';

test.describe('punkTwoFactor - Setup Flow', () => {
  test('should display punkTwoFactor provider and successfully enable 2FA', async ({ page }) => {
    const backoffice = new UmbracoBackofficePage(page);

    // Track API responses
    page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('2fa') || url.includes('two-factor') || url.includes('mfa')) {
        try {
          const json = await res.json();
          console.log(`[API RESPONSE ${res.status()}] ${url}:`, JSON.stringify(json));
        } catch {
          console.log(`[API RESPONSE ${res.status()}] ${url}`);
        }
      }
    });

    // 1. Log in to Umbraco backoffice
    await backoffice.login();

    // 2. Open User Profile -> Configure Two-Factor
    await backoffice.openConfigureTwoFactor();

    // 3. Verify punkTwoFactor provider ("Two Factor Authentication") is listed
    const providerHeader = page.locator('text=Two Factor Authentication').first();
    await expect(providerHeader).toBeVisible({ timeout: 15_000 });

    // 4. Click Enable on Two Factor Authentication
    const enableButton = page.locator('button:has-text("Enable"), uui-button:has-text("Enable")').first();
    await expect(enableButton).toBeVisible();
    await enableButton.click();

    // 5. Wait for the QR code image to appear
    const qrImage = page.locator('img[src*="data:image"]').first();
    await expect(qrImage).toBeVisible({ timeout: 15_000 });

    const qrDataUrl = await qrImage.getAttribute('src');
    expect(qrDataUrl).toBeTruthy();

    // Decode QR code image pixels using browser canvas and jsQR
    const pixelData = await page.evaluate(async (dataUrl) => {
      return new Promise<{ width: number; height: number; data: number[] }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          resolve({
            width: img.width,
            height: img.height,
            data: Array.from(imgData.data),
          });
        };
        img.onerror = reject;
        img.src = dataUrl!;
      });
    }, qrDataUrl);

    const qrResult = jsQR(new Uint8ClampedArray(pixelData.data), pixelData.width, pixelData.height);
    expect(qrResult?.data).toBeTruthy();

    const capturedSecret = extractSecretFromOtpAuthUri(qrResult!.data);
    console.log('Captured Secret:', capturedSecret);
    expect(capturedSecret).toBeTruthy();

    // Persist secret for login test
    saveTestState({
      totpSecret: capturedSecret!,
      enrolledUsername: process.env.UMBRACO_ADMIN_USERNAME || 'admin@example.com',
    });

    // Generate valid TOTP 6-digit code
    const totpCode = generateTotpCode(capturedSecret!);
    console.log('Generated TOTP code:', totpCode);

    // 6. Scroll input into view and fill verification code
    const codeInput = page.getByRole('textbox', { name: /verification code/i });
    await codeInput.scrollIntoViewIfNeeded();
    await codeInput.fill(totpCode);

    // 7. Click Submit / Save button (Umbraco uses uui-button with label="Save" and text "Submit")
    const submitBtn = page.getByRole('button', { name: 'Save' })
      .or(page.getByRole('button', { name: 'Submit' }))
      .or(page.locator('uui-button:has-text("Submit")'))
      .last();
    await submitBtn.click();

    // 8. Wait for response and log what appears
    await page.waitForTimeout(3000);
    console.log('After submit dialog text:\n', await page.locator('dialog').last().innerText().catch(() => 'none'));
    console.log('After submit buttons:\n', await page.locator('dialog').last().getByRole('button').allInnerTexts().catch(() => []));

    // If there is a Close/Done button on the dialog (e.g., recovery codes step), click it
    const closeOrDoneBtn = page.locator('dialog').last().getByRole('button', { name: /Close|Done|Confirm/i }).first();
    if (await closeOrDoneBtn.isVisible().catch(() => false)) {
      await closeOrDoneBtn.click();
    }

    // 9. Verify provider now shows "Disable"
    const disableButton = page.locator('button:has-text("Disable"), uui-button:has-text("Disable")').first();
    await expect(disableButton).toBeVisible({ timeout: 15_000 });
  });
});
