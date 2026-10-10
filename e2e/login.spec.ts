import { expect, test } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth/login')
  })

  test('should display the phone number input and submit button', async ({
    page,
  }) => {
    // Check that the URL is correct
    await expect(page).toHaveURL(/\/auth\/login/)

    // Check that the phone number input is visible by its placeholder
    const phoneInput = page.getByPlaceholder('09123456789')
    await expect(phoneInput).toBeVisible()

    // Check that the "ارسال کد ورود" submit button is visible and disabled initially
    const submitButton = page.getByRole('button', { name: 'ارسال کد ورود' })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeDisabled()
  })

  test('should enable the submit button when a valid 11-digit phone number is typed', async ({
    page,
  }) => {
    const phoneInput = page.getByPlaceholder('09123456789')
    const submitButton = page.getByRole('button', { name: 'ارسال کد ورود' })

    // Fill in a valid phone number
    await phoneInput.fill('09123456789')

    // The button should now be enabled
    await expect(submitButton).toBeEnabled()
  })

  test('should match login page screenshot baseline', async ({ page }) => {
    // Wait for fonts and network requests to stabilize
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot({ maxDiffPixels: 100 })
  })
})
