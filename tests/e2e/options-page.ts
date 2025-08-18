import type { Page, Locator } from '@playwright/test';

export class OptionsPage {
    private readonly unrecognizedWordsEnabled: Locator;
    private readonly unrecognizedWords: Locator;

    constructor(public readonly page: Page) {
        this.unrecognizedWordsEnabled = this.page.getByTestId('unregonized-words-enabled');
        this.unrecognizedWords = this.page.getByTestId('unregonized-words');
    }

    async goto(extensionId) {
        await this.page.goto(`chrome-extension://${extensionId}/options.html`);
    }

    async gotoTab(name) {
        await this.page.getByTestId(name).click();
    }

    async setRegion(region){
        const regionSelect = this.page.getByTestId('region');
        await regionSelect.selectOption(region);
    }

    locateRootAndAffixMode(){
        return this.page.getByTestId('root-and-affix-mode');
    }

}