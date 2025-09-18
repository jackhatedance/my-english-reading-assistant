import type { Page, Locator } from '@playwright/test';
import path from 'path';

export class TestPage {
    
    constructor(public readonly page: Page) {
    
    }

    async goto(relativePath) {
        if(!relativePath){
            relativePath = 'html/test.html';
        }

        const relativeFilePath = '../../e2e/'+relativePath;

        const file = "file:///" + path.join(__dirname, relativeFilePath);
        console.log(file);
        await this.page.goto(file);
    }

    async gotoPdf() {
        const url = "https://mozilla.github.io/pdf.js/web/viewer.html";
        await this.page.goto(url);
    }

}