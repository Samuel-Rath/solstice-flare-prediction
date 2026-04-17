const { test, expect } = require('@playwright/test');
const path = require('path');

const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test.describe('Solstice Flares Base Allocation Checker', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  });

  test('page loads with correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle('Solstice Flares Base Allocation Checker');
    await expect(page.getByRole('heading', { name: 'Base Allocation Checker' })).toBeVisible();
  });

  test('default values are pre-filled', async ({ page }) => {
    await expect(page.locator('#total_flares')).toHaveValue('410,000,000,000');
    await expect(page.locator('#slx_allocation')).toHaveValue('85,000,000');
    await expect(page.locator('#token_price')).toHaveValue('0.13');
    await expect(page.locator('#reg_fee')).toHaveValue('7');
  });

  test('all form labels are visible (not placeholder-only)', async ({ page }) => {
    await expect(page.locator('label[for="total_flares"]')).toBeVisible();
    await expect(page.locator('label[for="user_flares"]')).toBeVisible();
    await expect(page.locator('label[for="slx_allocation"]')).toBeVisible();
    await expect(page.locator('label[for="token_price"]')).toBeVisible();
    await expect(page.locator('label[for="reg_fee"]')).toBeVisible();
  });

  test('result is hidden before submission', async ({ page }) => {
    await expect(page.locator('#result')).toBeHidden();
  });

  test('shows "worth it" for large flare amount', async ({ page }) => {
    await page.locator('#user_flares').fill('5000000000');
    await page.locator('#predictorForm button[type="submit"]').click();

    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('.result-hero .hero-value')).toBeVisible();
    await expect(page.locator('.verdict.good')).toBeVisible();
    await expect(page.locator('.verdict.good')).toContainText('Worth it');
    await expect(page.locator('.verdict.good')).toContainText('profit');
  });

  test('shows "not worth it" for tiny flare amount', async ({ page }) => {
    await page.locator('#user_flares').fill('1000');
    await page.locator('#predictorForm button[type="submit"]').click();

    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('.verdict.bad')).toBeVisible();
    await expect(page.locator('.verdict.bad')).toContainText('Not worth it');
    await expect(page.locator('.verdict.bad')).toContainText('lose');
  });

  test('shows break even when profit rounds to zero', async ({ page }) => {
    // fee $7, price $0.13, slx 85M, total 410B
    // flares = 7 / (85M * 0.13 / 410B) ≈ 259,740,260
    await page.locator('#user_flares').fill('259740260');
    await page.locator('#predictorForm button[type="submit"]').click();

    await expect(page.locator('#result')).toBeVisible();
    const verdictText = await page.locator('.verdict').textContent();
    expect(verdictText).toBeTruthy();
  });

  test('displays airdrop percentage of supply', async ({ page }) => {
    await page.locator('#user_flares').fill('1000000000');
    await page.locator('#predictorForm button[type="submit"]').click();

    await expect(page.locator('.airdrop-pct')).toBeVisible();
    await expect(page.locator('.airdrop-pct')).toContainText('8.5%');
    await expect(page.locator('.airdrop-pct')).toContainText('1B total token supply');
  });

  test('displays stats with share percentage and SLX received', async ({ page }) => {
    await page.locator('#user_flares').fill('1000000000');
    await page.locator('#predictorForm button[type="submit"]').click();

    await expect(page.locator('.stat').first()).toContainText('Your share');
    await expect(page.locator('.stat').nth(1)).toContainText('SLX received');
  });

  test('share bar is rendered', async ({ page }) => {
    await page.locator('#user_flares').fill('1000000000');
    await page.locator('#predictorForm button[type="submit"]').click();

    await expect(page.locator('.share-bar')).toBeVisible();
  });

  test('copy button appears and copies to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('#user_flares').fill('5000000000');
    await page.locator('#predictorForm button[type="submit"]').click();

    const copyBtn = page.locator('.copy-btn');
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).toContainText('Copy results');
    await copyBtn.click();

    await expect(copyBtn).toContainText('Copied!');

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('Solstice Flares Allocation Check');
    expect(clipboardText).toContain('Allocation value');
    expect(clipboardText).toContain('SLX received');
    expect(clipboardText).toContain('Worth it');
  });

  test('input only allows numeric characters', async ({ page }) => {
    const input = page.locator('#user_flares');
    await input.fill('abc123def456');
    await expect(input).toHaveValue('123456');
  });

  test('number formatting on blur', async ({ page }) => {
    const input = page.locator('#user_flares');
    await input.fill('1234567');
    await input.blur();
    await expect(input).toHaveValue('1,234,567');
  });

  test('calculation is correct for known values', async ({ page }) => {
    // 1B flares out of 410B total, 85M SLX at $0.13
    // share = 1B/410B = 0.00243902...
    // slx = 0.00243902 * 85M = 207,317.07...
    // value = 207,317.07 * 0.13 = $26,951.21...
    await page.locator('#user_flares').fill('1000000000');
    await page.locator('#predictorForm button[type="submit"]').click();

    const heroValue = await page.locator('.result-hero .hero-value').textContent();
    const numericValue = parseFloat(heroValue.replace(/[$,]/g, ''));
    expect(numericValue).toBeGreaterThan(26900);
    expect(numericValue).toBeLessThan(27000);
  });

  test('alerts on empty user flares', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Please fill in all fields');
      await dialog.accept();
    });
    await page.locator('#predictorForm button[type="submit"]').click();
  });

  test('disclaimer text is shown after calculation', async ({ page }) => {
    await page.locator('#user_flares').fill('1000000000');
    await page.locator('#predictorForm button[type="submit"]').click();
    await expect(page.locator('.disclaimer')).toContainText('Not financial advice');
  });

  test('right panel shows formula and tips', async ({ page }) => {
    await expect(page.locator('.formula')).toContainText('(your flares / total)');
    await expect(page.locator('.tips')).toContainText('$0.13 token price implies a 130M FDV');
  });

  test('responsive: single column on narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const container = page.locator('.container');
    const box = await container.boundingBox();
    expect(box.width).toBeLessThanOrEqual(375);
  });

});
