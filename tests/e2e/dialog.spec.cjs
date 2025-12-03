import { test, expect } from './fixtures';




test('dialog vocabulary unknown word definition', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#base-form mea-token[data-query='this']");
  await word.click();

  const iframeLocator = testPage.page.frameLocator('#mea-vueapp-iframe');

  await iframeLocator.getByTestId("vocabulary-tab-header").click();
  await iframeLocator.getByTestId("showAllDefinitions").click();
  
  let unknownWordListLocator = iframeLocator.locator("#unknownWordList");
  await expect(unknownWordListLocator).toContainText("supplicant/'sʌplikәnt/  恳求, 哀求, 祈求");

});

