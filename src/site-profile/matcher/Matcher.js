class Matcher {
    constructor(name){
        this._name = name;
    }
    
    match(document){
        return false;
    }

    get name(){
        return this._name;
    }
}


export { Matcher};