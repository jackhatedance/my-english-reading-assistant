import type { Page, Locator } from '@playwright/test';
import { elButton } from './element-plus/element-plus.cjs'

export class PopupPage {
    private readonly switch: Locator;
    private readonly switchMode: Locator;
    private readonly dualAnnotation: Locator;

    constructor(public readonly page: Page) {
        this.switch = this.page.getByTestId('switch');
        this.switchMode = this.page.getByTestId('switch-mode');
        this.dualAnnotation = this.page.getByTestId('dual-annotation');
    }

    async goto(extensionId) {
        await this.page.goto(`chrome-extension://${extensionId}/popup.html?index=1`);
    }

    async toggle() {
        await elButton(this.switch).click();
    }

}