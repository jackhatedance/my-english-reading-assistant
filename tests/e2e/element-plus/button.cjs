export class Button {
    constructor(root){
        this.root = root;
    }

    async click(){
        const core = this.root.locator('.el-switch__core');
        await core.click();
    }
}