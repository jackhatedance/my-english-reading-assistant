import { test, expect } from './fixtures';

test('unrecognized words capturing', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('unrecognized-words');

  await optionsPage.unrecognizedWordsEnabled.click();
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();

  let rode = testPage.page.locator("#unrecognized-words mea-token[data-query='Alice']");
  await expect(rode).toHaveAttribute('data-word', '');
  
  await optionsPage.goto(extensionId); 
  await optionsPage.gotoTab('unrecognized-words');
  await expect(optionsPage.unrecognizedWords).toHaveValue('Alice\ntokenization');
  
});
