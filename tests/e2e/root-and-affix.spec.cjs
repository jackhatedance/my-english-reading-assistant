import { test, expect } from './fixtures';


test('root and affix mode disabled hopeless', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();

  let rode = testPage.page.locator("#root-and-affix mea-token[data-query='hopeless']");
  await expect(rode).toHaveClass('mea-element mea-highlight mea-word');
});


test('root and affix mode enabled hopeless', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('root-and-affix');

  await optionsPage.locateRootAndAffixMode().click();
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();

  let rode = testPage.page.locator("#root-and-affix mea-token[data-query='hopeless']");
  await expect(rode).toHaveClass('mea-element mea-highlight mea-hide mea-word');
  
});
