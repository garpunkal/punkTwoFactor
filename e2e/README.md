# Playwright E2E Tests for punkTwoFactor

Automated end-to-end test suite for `punkTwoFactor` in Umbraco Backoffice using Playwright.

## Test Coverage

1. **`01-backoffice-2fa-setup.spec.ts`**:
   - Logs into Umbraco Backoffice.
   - Navigates to **User Profile -> Configure Two-Factor**.
   - Verifies the **Two Factor Authentication** provider is registered and active.
   - Clicks **Enable**, validates the setup modal and QR code.
   - Extracts the TOTP secret key directly from the API response / modal.
   - Automatically computes a valid RFC 6238 6-digit TOTP code and submits verification.
   - Asserts the provider changes to "Enabled" / "Disable".

2. **`02-backoffice-2fa-login.spec.ts`**:
   - Launches a fresh browser session (unauthenticated).
   - Enters username & password.
   - Verifies the 2FA challenge screen is triggered.
   - **Negative test**: Submits invalid 6-digit code (`000000`) and asserts error feedback.
   - **Positive test**: Computes the valid real-time TOTP code from the enrolled secret and verifies backoffice dashboard access.

3. **`03-backoffice-2fa-disable.spec.ts`**:
   - Navigates back to **Configure Two-Factor**.
   - Clicks **Disable** and confirms removal.
   - Verifies provider reverts to "Enable" state.

---

## Getting Started

### 1. Install Dependencies

From the `e2e/` folder:

```bash
cd e2e
npm install
npx playwright install chromium
```

### 2. Configure Environment

A `.env` is already created with the default `UmbracoTestSite` credentials:

```env
UMBRACO_BASE_URL=https://localhost:44384
UMBRACO_ADMIN_USERNAME=admin@example.com
UMBRACO_ADMIN_PASSWORD=Password123!
HEADLESS=true
```

Playwright is configured with a built-in `webServer` task that automatically launches `UmbracoTestSite` (configured with unattended SQLite installation) if it's not already running!

---

## Running the Tests

- **Run all specs headless**:
  ```bash
  npm test
  ```

- **Run in interactive UI Mode**:
  ```bash
  npm run test:ui
  ```

- **Run in headed browser (watch tests execute)**:
  ```bash
  npm run test:headed
  ```

- **View HTML test report**:
  ```bash
  npm run report
  ```

---

## Using Playwright Codegen (Interactive Recording)

If you want to record custom actions or inspect Umbraco elements live in the browser:

```bash
npm run codegen:umbraco
```

Or specify any custom URL:

```bash
npx playwright codegen https://localhost:44300/umbraco
```
