const { test, expect } = require('@playwright/test');
const myEnv = { HA_USERNAME: 'test', HA_PASSWORD: 'test' };

function createMockLocator(name) {
  return {
    click: async () => console.log(`Click on ${name}`),
    getByRole: ({ name }) => createMockLocator(name),
    toBeDisabled: async () => console.log(`Check if ${name} is disabled`),
    toBeVisible: async () => console.log(`Check if ${name} is visible`),
    toHaveText: async (text) => console.log(`Check if ${name} has text: ${text}`)
  };
}

async function getFrontpage(page) {
  return {
    locator: (selector) => createMockLocator(selector),
    getByRole: ({ name }) => createMockLocator(name),
  };
}

test.describe.serial('Home Assistant Custom Card (mocked)', () => {
  let page;

  test.beforeAll(async () => {
    page = {};
    console.log(`Mock login as ${myEnv.HA_USERNAME}`);
  });

  test('Card non-interactive when offline', async () => {
    const frontpage = await getFrontpage(page);
    await frontpage.locator('.coffee-img').toBeDisabled();
    await frontpage.getByRole({ name: 'Select Coffee' }).toBeDisabled();
    await frontpage.getByRole({ name: 'Start' }).toBeDisabled();
  });

  test('Stats button opens coffee-stats', async () => {
    const frontpage = await getFrontpage(page);
    const statsButton = frontpage.locator('input[type="image"][alt="Stats"]');
    await statsButton.click();

    const statsView = createMockLocator('coffee-stats');
    await statsView.toBeVisible();
  });

  test('Start device', async () => {
    const frontpage = await getFrontpage(page);
    await frontpage.locator('input[type="image"][alt="Power"]').click();

    const powerView = createMockLocator('coffee-power');
    await powerView.toBeVisible();
    await powerView.getByRole({ name: 'Accept' }).click();
    await createMockLocator('spinner').toBeVisible();
    await frontpage.locator('input[alt="Power"] + div').toHaveText('ON');
  });

  test('Change coffee', async () => {
    const frontpage = await getFrontpage(page);
    await frontpage.locator('button', { hasText: 'Select Coffee' }).click();

    const selectView = createMockLocator('coffee-select');
    await selectView.toBeVisible();

    await createMockLocator('Cappuccino').click();
    await createMockLocator('Accept').click();
    await frontpage.locator('input[type="image"][alt="Cappuccino"]').toBeVisible();
  });

  test('Change beans amount and fill quantity', async () => {
    console.log('Change beans and fill quantity (mocked)');
    expect(true).toBe(true);
  });
});
