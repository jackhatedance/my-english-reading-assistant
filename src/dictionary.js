import {dict as dictLarge} from './dict.js'
import {dict as dictSmall} from './dict-small.js'
import {dict as dictAffix} from './dict-affix.js'

function lookup(word, dicts) {
    //console.log(dict);

    //try small dict first, hits 90%
    let def;

    for(let name of dicts){
        let dict = getDict(name);
        def = dict[word];
        if(def){
           break; 
        }
    }    

    return def;
}

function getDict(name){
    if(name==='small'){
        return dictSmall;
    }else if(name==='large'){
        return dictLarge;
    }else if(name==='affix'){
        return dictAffix;
    }else{
        return null;
    }
}

function lookupShort(word) {
    let def = lookup(word, ['affix', 'small','large']);
    if(def){
        //def = removeWordClass(def);
        //def = firstMeaning(def);
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