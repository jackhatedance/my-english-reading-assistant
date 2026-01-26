import { test, expect } from './fixtures';



test('dialog actions mark word boys', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#transform mea-token[data-query='boys']");
  await word.click();

  const iframeLocator = testPage.page.frameLocator('#mea-vueapp-iframe');

  await iframeLocator.locator("#tab-vocabulary").click();
  const wordStatisticsLocator = iframeLocator.locator('#wordStatistics');
  await expect(wordStatisticsLocator).toContainText("17/");

  await iframeLocator.locator("#tab-actions").click();
  await iframeLocator.getByTestId("markWordToggle").click();
  
  await iframeLocator.getByTestId("dialogCloseButton").click();

  await testPage.page.waitForTimeout(2000);

  await word.click();

  await iframeLocator.locator("#tab-vocabulary").click();
  await expect(wordStatisticsLocator).toContainText("19/");

});



test('dialog vocabulary unknown word definition', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#base-form mea-token[data-query='this']");
  await word.click();

  const iframeLocator = testPage.page.frameLocator('#mea-vueapp-iframe');

  const wordStatisticsLocator = iframeLocator.locator('#wordStatistics');
  await expect(wordStatisticsLocator).toContainText("17/102");

  await iframeLocator.locator("#tab-vocabulary").click();
  await iframeLocator.getByTestId("showAllDefinitions").click();
  
  let unknownWordListLocator = iframeLocator.locator("#unknownWordList");
  await expect(unknownWordListLocator).toContainText("supplicant/'sʌplikәnt/  恳求, 哀求, 祈求");

  let unknownWordListWordsLocator = iframeLocator.locator("#unknownWordList .word");
  await expect(unknownWordListWordsLocator).toHaveText([
    "supplicant",
    "zorse",
    "misjudgement",
    "glacier",
    "abode",
    "buckle",
    "crenel",
    "washed",
    "ditch (ditching)",
    "ditching",
    "af- (affix)",
    "affix",
    "hopeless",
    "enormity",
    "haired (black-haired)",
    "black-haired",
    "famed (far-famed)",
    "far-famed",
    "bion (bionic)",
    "-ic (bionic)",
    "bionic",
    "unfetter (unfettered)",
    "unfettered",
  ]);

});

