export class Switch {
    constructor(root){
        this.root = root;
    }

    input(){
        return this.root.locator('.el-switch__input');
    }
    
}