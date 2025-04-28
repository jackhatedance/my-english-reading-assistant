import type { Page, Locator } from '@playwright/test';
import path from 'path';

export class TestPage {
    
    constructor(public readonly page: Page) {
    
    }

    async goto() {
        const file = "file:///" + path.join(__dirname, '../../e2e/html/test.html');
        console.log(file);
        await this.page.goto(file);
    }


}