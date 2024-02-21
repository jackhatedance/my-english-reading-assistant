import {dict} from './dict.js'

function lookup(word) {
    let def = dict[word];
    
    return def;
}

function lookupShort(word) {
    let def = dict[word];
    if(def){
        def = removeWordClass(def);
        def = firstMeaning(def);
    }

    return def;
}

//remove 'a.' , return only def
function removeWordClass(def){
    if(def){
        var rx = /^((\w{1,6}\.)+ )?(.+)$/;
        var arr = rx.exec(def);
        //console.log(arr)
        return arr[3]; 
    }
}

function firstMeaning(meaning){
    if(meaning){
        let arr = meaning.split(',');
        return arr[0];
    }

    return meaning;
}



export { lookup, lookupShort, removeWordClass, firstMeaning };