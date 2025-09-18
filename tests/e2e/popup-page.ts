import type { Page, Locator } from '@playwright/test';

export class PopupPage {
    private readonly switchCheckbox: Locator;
    private readonly switchBtn: Locator;
    private readonly switchMode: Locator;

    constructor(public readonly page: Page) {
        this.switchCheckbox = this.page.getByTestId('switch');
        this.switchBtn = this.page.locator('.slider');
        this.switchMode = this.page.getByTestId('switch-mode');
    }

    async goto(extensionId) {
        await this.page.goto(`chrome-extension://${extensionId}/popup2.html?index=1`);
    }

    async toggle() {
        await this.switchBtn.click();
    }

}