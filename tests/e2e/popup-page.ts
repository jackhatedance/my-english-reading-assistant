import type { Page, Locator } from '@playwright/test';

export class PopupPage {
    private readonly switchBtn: Locator;

    constructor(public readonly page: Page) {
        this.switchBtn = this.page.locator('.slider');
    }

    async goto(extensionId) {
        await this.page.goto(`chrome-extension://${extensionId}/popup2.html?index=1`);
    }

    async toggle() {
        await this.switchBtn.click();
    }

}