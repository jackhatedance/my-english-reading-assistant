import { test, expect } from './fixtures';



test('options page click tabs', async ({ optionsPage, extensionId }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('general');
  await optionsPage.setRegion('US');
  

});


test('enable page', async ({ page, extensionId, popupPage }) => {
  
  await page.goto(`https://example.com`);
  
  await popupPage.goto(extensionId);  
  await popupPage.toggle();

  const body = page.locator('body');
  await expect(body).toHaveAttribute('mea-preprocessed', 'true');

});
