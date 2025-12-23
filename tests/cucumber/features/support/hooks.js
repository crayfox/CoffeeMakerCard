const myEnv = {};
require('dotenv').config({ processEnv: myEnv });
const { AfterAll, Before, BeforeAll } = require('@cucumber/cucumber');
const { chromium } = require("playwright");

let browser;
let context;
let page;

BeforeAll({ timeout: 20000 }, async function () {
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage();

  this.page = page;

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

Before({timeout: 20000 }, async function() {
  this.page = page;

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

  const frontpage = page.locator('coffee-frontpage');
  await frontpage.waitFor({ state: "visible", timeout: 20000 });

  this.frontpage = frontpage;
});

AfterAll(async function () {
  await browser.close();
});