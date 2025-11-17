export class Switch {
    constructor(root){
        this.root = root;
    }

    async getValue(){
        const inputElement = this.root.locator('.el-switch__input');
        const value = await inputElement.inputValye();
        return value;
    }
}