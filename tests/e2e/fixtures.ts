import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { PopupPage } from './popup-page';
import { OptionsPage } from './options-page';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  popupPage: PopupPage;
  optionsPage: OptionsPage;
}>({
  context: async ({ }, use) => {
    const pathToExtension = path.join(__dirname, '../../build');
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    /*
    // for manifest v2:
    let [background] = context.backgroundPages()
    if (!background)
      background = await context.waitForEvent('backgroundpage')
    */

    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
  popupPage: async ({ context }, use) => {
    let page = await context.newPage();
    await use(new PopupPage(page));
  },
  optionsPage: async ({ context }, use) => {
    let page = await context.newPage();
    await use(new OptionsPage(page));
  },
});
export const expect = test.expect;