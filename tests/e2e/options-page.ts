import type { Page, Locator } from '@playwright/test';

export class OptionsPage {
    
    constructor(public readonly page: Page) {
    
    }

    async goto(extensionId) {
        await this.page.goto(`chrome-extension://${extensionId}/options2.html`);
    }

    async gotoTab(name) {
        await this.page.getByTestId(name).click();
    }

    async setRegion(region){
        const regionSelect = this.page.getByTestId('region');
        await regionSelect.selectOption('us');
    }

}