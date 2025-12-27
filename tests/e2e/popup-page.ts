import type { Page, Locator } from '@playwright/test';
import { elButton } from './element-plus/element-plus.cjs'

export class PopupPage {
    private readonly switch: Locator;
    private readonly switchMode: Locator;
    private readonly dualAnnotation: Locator;

    private readonly annotationTabHeader: Locator;
    private readonly textTabHeader: Locator;
    private readonly dictionaryTabHeader: Locator;
    private readonly miscTabHeader: Locator;

    private readonly virtualSite: Locator;

    constructor(public readonly page: Page) {
        this.switch = this.page.getByTestId('switch');
        this.switchMode = this.page.getByTestId('switch-mode');
        this.dualAnnotation = this.page.getByTestId('dual-annotation');

        this.annotationTabHeader = this.page.locator('#tab-annotation');
        this.textTabHeader = this.page.locator('#tab-text');
        this.dictionaryTabHeader = this.page.locator('#tab-dictionary');
        this.miscTabHeader = this.page.locator('#tab-misc');

        this.virtualSite = this.page.getByTestId('virtual-site');
    }

    async goto(extensionId) {
        await this.page.goto(`chrome-extension://${extensionId}/popup.html?index=1`);
    }

    async toggle() {
        await elButton(this.switch).click();
    }

}