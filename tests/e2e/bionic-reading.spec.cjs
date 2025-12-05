import { test, expect } from './fixtures';


test('bionic reading', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);

  await popupPage.page.getByTestId('text-tab-header').click();
  await popupPage.page.getByTestId('bionic-switch').click();
  await popupPage.toggle();

  let rode = testPage.page.locator("#bionic-reading mea-token[data-query='unfettered']");
  await expect(rode).toHaveAttribute('data-footnote-short', 'a. 自由自在的; 无拘无束的');
});


