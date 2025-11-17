export class Select {
    constructor(root){
        this.root = root;
    }

    selected(){
        return this.root.locator('.el-select__selected-item.el-select__placeholder');
    }

    async selectOptionByText(text){
        await this.root.click();
        
        const inputLocator = this.root.locator('.el-select__input');
        const ariaControls = await inputLocator.getAttribute('aria-controls');

        let controlsId = ariaControls.split('-')[2];
        
        let optionsId = 'el-popper-container-' + controlsId;
        //console.log(optionsId);
        const optionsLocator = this.root.page().locator('#'+ optionsId);
        const selectedTextElement = optionsLocator.locator(`.el-select-dropdown__item>span:has-text("${text}")`);
        await selectedTextElement.click();
    }
}