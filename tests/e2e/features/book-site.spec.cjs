import { test, expect } from '../fixtures';
import { elSwitch } from '../element-plus/element-plus.cjs'


test('book site - site option default is off', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await testPage.goto();

  await popupPage.goto(extensionId);

  await popupPage.miscTabHeader.click();

  const virtualSiteSwitch = elSwitch(popupPage.virtualSite);
    
  await expect(virtualSiteSwitch.input()).not.toBeChecked();
});



