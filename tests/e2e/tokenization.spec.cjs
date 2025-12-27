import { test, expect } from './fixtures';


test('tokenization - punctuation-leading-word', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);

  await popupPage.textTabHeader.click();
  await popupPage.toggle();

  let rode = testPage.page.locator("#punctuation-leading-word .leading-punctuation mea-token");
  await expect(rode).toHaveAttribute('data-footnote-short', '');

  let word = testPage.page.locator("#punctuation-leading-word mea-token[data-query='Enormity']");
  await expect(word).toHaveAttribute('data-footnote-short', 'n. 暴行; 极恶; 巨大');
  
});


