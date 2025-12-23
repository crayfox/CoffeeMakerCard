const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');

Then("the coffee image should be disabled", async function () {
  await expect(this.frontpage.locator('.coffee-img')).toBeDisabled();
});

Then('the {string} button should be disabled', async function (name) {
  await expect(this.frontpage.getByRole('button', { name: name })).toBeDisabled();
});

When("I click the stats button", async function () {
  await this.frontpage.locator('input[type="image"][alt="Stats"]').click();
});

Then("the stats view should be visible", async function () {
  await expect(this.page.locator('coffee-stats')).toBeVisible();
});

When("I click the power button", async function () {
  await this.frontpage.locator('input[type="image"][alt="Power"]').click();
});

Then("the power view should be visible", async function () {
  await expect(this.page.locator("coffee-power")).toBeVisible();
});

When("I confirm the power start", async function () {
  await this.page.locator("coffee-power").getByRole("button", { name: "Accept" }).click();
});

Then("the power spinner should appear", async function () {
  await expect(this.page.locator("coffee-power").locator(".spinner")).toBeVisible();
});

Then("the device status should be {string}", async function (state) {
  await expect(
    this.frontpage.locator('input[alt="Power"] + div')
  ).toHaveText(state, { timeout: 20000 });
});

When("I open the coffee selection", async function () {
  await this.frontpage.getByRole("button", { name: "Select Coffee" }).click();
});

When("I choose {string}", async function (coffee) {
  await this.page.locator("span", { hasText: coffee }).click();
});

When("I accept the selection", async function () {
  await this.page.locator("button", { hasText: "Accept" }).click();
});

Then("the coffee picture {string} should be visible", async function (coffee) {
  await expect(
    this.frontpage.locator(`input[type="image"][alt="${coffee}"]`)
  ).toBeVisible();
});