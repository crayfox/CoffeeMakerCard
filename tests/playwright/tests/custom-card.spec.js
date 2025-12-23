const myEnv = {};
require('dotenv').config({ processEnv: myEnv });
const { test, expect } = require('@playwright/test');

test.describe.serial('Home Assistant Custom Card', () => {

  let page;
  let frontpage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto(myEnv.HA_URL);
    await page.fill('input[name="username"]', myEnv.HA_USERNAME);
    await page.fill('input[name="password"]', myEnv.HA_PASSWORD);
    await page.click('button[type="button"]');
    await page.waitForSelector("hui-root", { timeout: 30000 });
    
    const menuButton = page.locator("ha-menu-button");
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  });

  test.beforeEach(async () => {
    const settingsView = page
      .locator("ha-sidebar")
      .locator("ha-md-list-item")
      .filter({ hasText: "Settings" });

    await settingsView.click();

    const frontpageView = page
      .locator("ha-sidebar")
      .locator("ha-md-list-item")
      .filter({ hasText: "Test" });

    await frontpageView.click();

    frontpage = page.locator('coffee-frontpage');
    await expect(frontpage).toBeVisible({ timeout: 20000 });
  });

  test('Card non-interactive when offline', async () => {
    await expect(frontpage.locator('.coffee-img')).toBeDisabled();
    await expect(frontpage.getByRole('button', { name: 'Select Coffee' })).toBeDisabled();
    await expect(frontpage.getByRole('button', { name: 'Start' })).toBeDisabled();
  });

  test('Stats button opens coffee-stats', async () => {
    const statsButton = frontpage.locator('input[type="image"][alt="Stats"]');
    await statsButton.click();

    const statsView = page.locator('coffee-stats');
    await expect(statsView).toBeVisible();
  });

  test('Start device', async () => {
    await frontpage.locator('input[type="image"][alt="Power"]').click();

    const powerView = page.locator('coffee-power');
    await expect(powerView).toBeVisible();

    await powerView.getByRole('button', { name: 'Accept' }).click();

    await expect(powerView.locator('.spinner')).toBeVisible();

    await expect(frontpage.locator('input[alt="Power"] + div')).toHaveText('ON', { timeout: 20000 });
  });

  test('Change coffee', async () => {
    const selectButton = frontpage.locator('button', { hasText: 'Select Coffee'});
    await selectButton.click();

    const selectView = page.locator('coffee-select');
    await expect(selectView).toBeVisible();

    const cappuccino = page.locator('span', { hasText: 'Cappuccino' });
    await cappuccino.click();

    const acceptButton = page.locator('button', { hasText: 'Accept' });
    await acceptButton.click();

    const coffeePicture = page.locator('input[type="image"][alt="Cappuccino"]')
    await expect(coffeePicture).toBeVisible();
  });
});