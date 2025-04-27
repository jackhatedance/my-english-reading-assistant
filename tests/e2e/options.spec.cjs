import { test, expect } from './fixtures';



test('has title', async ({ page, extensionId }) => {
  
  await page.goto(`chrome-extension://${extensionId}/options2.html`);
  await expect(page).toHaveTitle(/Options/);
});

test('click tabs', async ({ page, extensionId }) => {
  
  await page.goto(`chrome-extension://${extensionId}/options2.html`);
  const general = page.getByTestId('general');
  await general.click();

  const region = page.getByTestId('region');
  await region.selectOption('us');

});